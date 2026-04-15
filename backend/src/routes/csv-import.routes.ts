import { Router } from "express";
import multer from "multer";
import { csvImportService } from "../services/csv-import.service";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth.middleware";

const csvImportRouter = Router();

// Configure multer for CSV upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// List all imports
csvImportRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  const imports = await csvImportService.listImports();
  res.json({ data: imports });
}));

// Get single import with details
csvImportRouter.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id as string);
  const importRecord = await csvImportService.getImport(id);
  
  if (!importRecord) {
    res.status(404).json({ error: "Import not found" });
    return;
  }
  
  const leads = await csvImportService.getImportLeads(id);
  res.json({ data: { ...importRecord, leads } });
}));

// Upload and process CSV
csvImportRouter.post("/", requireAuth, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const userEmail = (req as any).auth?.email || "system";
  
  // Create import record
  const importRecord = await csvImportService.createImport(req.file.originalname, userEmail);
  
  // Parse CSV
  const csvContent = req.file.buffer.toString("utf-8");
  const rows = parseCSV(csvContent);
  
  console.log(`[CSV Import] Starting processing for ${rows.length} rows`);
  
  // Process synchronously (faster for small files, ensures completion)
  try {
    const result = await csvImportService.processCSV(importRecord.id, rows, userEmail);
    console.log(`[CSV Import] Completed: ${result.success} success, ${result.failed} failed`);
    res.status(201).json({ 
      data: importRecord,
      success: result.success,
      failed: result.failed,
      message: `Imported ${result.success} leads successfully.`,
    });
  } catch (err) {
    console.error("[CSV Import] Processing error:", err);
    res.status(500).json({ 
      error: "Failed to process CSV",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}));

// Delete import and its leads
csvImportRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id as string);
  await csvImportService.deleteImport(id);
  res.json({ success: true, message: "Import deleted successfully" });
}));

// Parse CSV string to array of objects
function parseCSV(csvString: string): any[] {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx]?.trim() || "";
      });
      rows.push(row);
    }
  }
  
  return rows;
}

// Parse a single CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

export { csvImportRouter };
