import { prisma } from "../config/prisma";

type AttendanceRecord = {
  id: number;
  name: string;
  role: "Admin" | "Manager" | "Employee";
  department: string;
  status: "present" | "late" | "remote" | "absent";
  checkIn: string;
  location: string;
  note: string;
};

export const attendanceService = {
  async list() {
    const members = await prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const data: AttendanceRecord[] = members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      status: member.attendance as AttendanceRecord["status"],
      checkIn: member.checkIn,
      location: member.location,
      note:
        member.attendance === "absent"
          ? "Needs follow-up"
          : member.attendance === "late"
            ? "Late check-in"
            : member.attendance === "remote"
              ? "Remote today"
              : "On time",
    }));

    return { data };
  },

  async update(memberId: number, data: { status: AttendanceRecord["status"]; checkIn: string; location: string }) {
    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        attendance: data.status,
        checkIn: data.checkIn,
        location: data.location,
      },
    });

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      status: member.attendance as AttendanceRecord["status"],
      checkIn: member.checkIn,
      location: member.location,
      note:
        member.attendance === "absent"
          ? "Needs follow-up"
          : member.attendance === "late"
            ? "Late check-in"
            : member.attendance === "remote"
              ? "Remote today"
              : "On time",
    };
  },
};
