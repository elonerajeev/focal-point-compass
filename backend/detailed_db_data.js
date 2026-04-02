const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showDetailedData() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           DETAILED DATABASE RECORDS                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // ===== USERS =====
    const users = await prisma.user.findMany({ 
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        team: true,
        designation: true,
        baseSalary: true,
        paymentMode: true
      }
    });
    console.log('┌─ 👤 USERS (' + users.length + ') ─────────────────────────────────────────────┐');
    users.forEach((u, i) => {
      console.log(`│ ${i+1}. ${u.name}`);
      console.log(`│    Email: ${u.email}`);
      console.log(`│    Role: ${u.role} | ID: ${u.employeeId}`);
      console.log(`│    Dept: ${u.department} | Team: ${u.team}`);
      console.log(`│    Designation: ${u.designation}`);
      console.log(`│    Salary: ₹${u.baseSalary.toLocaleString()} | Payment: ${u.paymentMode}`);
      if (i < users.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== CLIENTS =====
    const clients = await prisma.client.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ 🏢 CLIENTS (' + clients.length + ') ───────────────────────────────────────────┐');
    clients.forEach((c, i) => {
      console.log(`│ ${i+1}. ${c.name}`);
      console.log(`│    Email: ${c.email} | Company: ${c.company || 'N/A'}`);
      console.log(`│    Status: ${c.status} | Tier: ${c.tier} | Segment: ${c.segment}`);
      console.log(`│    Industry: ${c.industry} | Manager: ${c.manager}`);
      console.log(`│    Revenue: ${c.revenue} | Health Score: ${c.healthScore}/100`);
      console.log(`│    Location: ${c.location} | Next Action: ${c.nextAction}`);
      if (i < clients.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== PROJECTS =====
    const projects = await prisma.project.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ 📊 PROJECTS (' + projects.length + ') ─────────────────────────────────────────┐');
    projects.forEach((p, i) => {
      console.log(`│ ${i+1}. ${p.name}`);
      console.log(`│    Status: ${p.status} | Stage: ${p.stage} | Progress: ${p.progress}%`);
      console.log(`│    Budget: ${p.budget} | Due: ${p.dueDate || 'Not set'}`);
      console.log(`│    Tasks: ${p.tasksDone}/${p.tasksTotal} completed`);
      console.log(`│    Team: ${p.team.length > 0 ? p.team.join(', ') : 'No team assigned'}`);
      console.log(`│    Description: ${p.description || 'No description'}`);
      if (i < projects.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== TASKS =====
    const tasks = await prisma.task.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ ✅ TASKS (' + tasks.length + ') ──────────────────────────────────────────────┐');
    const tasksByColumn = { todo: [], in_progress: [], done: [] };
    tasks.forEach(t => tasksByColumn[t.column].push(t));
    
    ['todo', 'in_progress', 'done'].forEach(col => {
      const colName = col === 'in_progress' ? 'IN PROGRESS' : col.toUpperCase();
      console.log(`│ ${colName} (${tasksByColumn[col].length}):`);
      tasksByColumn[col].forEach((t, i) => {
        console.log(`│   ${i+1}. ${t.title}`);
        console.log(`│      Assignee: ${t.assignee} | Priority: ${t.priority}`);
        console.log(`│      Due: ${t.dueDate} | Stream: ${t.valueStream}`);
        console.log(`│      Tags: ${t.tags.join(', ') || 'None'}`);
      });
      if (col !== 'done') console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== TEAM MEMBERS =====
    const teamMembers = await prisma.teamMember.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ 👥 TEAM MEMBERS (' + teamMembers.length + ') ──────────────────────────────────────┐');
    teamMembers.forEach((t, i) => {
      console.log(`│ ${i+1}. ${t.name}`);
      console.log(`│    Email: ${t.email}`);
      console.log(`│    Role: ${t.role} | Status: ${t.status}`);
      console.log(`│    Dept: ${t.department} | Team: ${t.team}`);
      console.log(`│    Designation: ${t.designation} | Manager: ${t.manager}`);
      console.log(`│    Attendance: ${t.attendance} | Check-in: ${t.checkIn} | Location: ${t.location}`);
      console.log(`│    Salary: ₹${t.baseSalary.toLocaleString()} + ₹${t.allowances.toLocaleString()} - ₹${t.deductions.toLocaleString()}`);
      console.log(`│    Payment: ${t.paymentMode} | Workload: ${t.workload}`);
      if (i < teamMembers.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== INVOICES =====
    const invoices = await prisma.invoice.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ 💰 INVOICES (' + invoices.length + ') ─────────────────────────────────────────┐');
    invoices.forEach((inv, i) => {
      console.log(`│ ${i+1}. Invoice #${inv.id}`);
      console.log(`│    Client: ${inv.client}`);
      console.log(`│    Amount: ${inv.amount} | Status: ${inv.status}`);
      console.log(`│    Date: ${inv.date} | Due: ${inv.due}`);
      if (i < invoices.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== NOTES =====
    const notes = await prisma.note.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log('┌─ 📝 NOTES (' + notes.length + ') ──────────────────────────────────────────────┐');
    notes.forEach((n, i) => {
      console.log(`│ ${i+1}. ${n.title} ${n.isPinned ? '📌' : ''}`);
      console.log(`│    Color: ${n.color} | Author: ${n.authorId}`);
      console.log(`│    Content: ${n.content.substring(0, 60)}${n.content.length > 60 ? '...' : ''}`);
      if (i < notes.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    // ===== REFRESH TOKENS =====
    const tokens = await prisma.refreshToken.findMany({ 
      where: { revokedAt: null },
      include: { User: { select: { name: true, email: true } } }
    });
    console.log('┌─ 🔑 ACTIVE REFRESH TOKENS (' + tokens.length + ') ──────────────────────────────┐');
    tokens.forEach((t, i) => {
      console.log(`│ ${i+1}. User: ${t.User.name} (${t.User.email})`);
      console.log(`│    Expires: ${t.expiresAt.toISOString()}`);
      if (i < tokens.length - 1) console.log('│');
    });
    console.log('└────────────────────────────────────────────────────────────────┘\n');
    
    console.log('✅ Database inspection complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showDetailedData();
