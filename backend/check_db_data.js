const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('\n=== DATABASE RECORDS SUMMARY ===\n');
    
    // Users
    const users = await prisma.user.findMany({ where: { deletedAt: null } });
    console.log(`👤 USERS: ${users.length} records`);
    if (users.length > 0) {
      console.log('   Sample:', users.slice(0, 3).map(u => `${u.name} (${u.email}) - ${u.role}`).join('\n           '));
    }
    
    // Clients
    const clients = await prisma.client.findMany({ where: { deletedAt: null } });
    console.log(`\n🏢 CLIENTS: ${clients.length} records`);
    if (clients.length > 0) {
      console.log('   Sample:', clients.slice(0, 3).map(c => `${c.name} - ${c.status} - ${c.tier}`).join('\n           '));
    }
    
    // Projects
    const projects = await prisma.project.findMany({ where: { deletedAt: null } });
    console.log(`\n📊 PROJECTS: ${projects.length} records`);
    if (projects.length > 0) {
      console.log('   Sample:', projects.slice(0, 3).map(p => `${p.name} - ${p.status} - ${p.progress}%`).join('\n           '));
    }
    
    // Tasks
    const tasks = await prisma.task.findMany({ where: { deletedAt: null } });
    console.log(`\n✅ TASKS: ${tasks.length} records`);
    if (tasks.length > 0) {
      const byColumn = tasks.reduce((acc, t) => {
        acc[t.column] = (acc[t.column] || 0) + 1;
        return acc;
      }, {});
      console.log('   By column:', JSON.stringify(byColumn));
    }
    
    // Team Members
    const teamMembers = await prisma.teamMember.findMany({ where: { deletedAt: null } });
    console.log(`\n👥 TEAM MEMBERS: ${teamMembers.length} records`);
    if (teamMembers.length > 0) {
      console.log('   Sample:', teamMembers.slice(0, 3).map(t => `${t.name} - ${t.role} - ${t.department}`).join('\n           '));
    }
    
    // Invoices
    const invoices = await prisma.invoice.findMany({ where: { deletedAt: null } });
    console.log(`\n💰 INVOICES: ${invoices.length} records`);
    if (invoices.length > 0) {
      console.log('   Sample:', invoices.slice(0, 3).map(i => `${i.client} - ${i.amount} - ${i.status}`).join('\n           '));
    }
    
    // Notes
    const notes = await prisma.note.findMany({ where: { deletedAt: null } });
    console.log(`\n📝 NOTES: ${notes.length} records`);
    if (notes.length > 0) {
      console.log('   Sample:', notes.slice(0, 3).map(n => `${n.title} - pinned: ${n.isPinned}`).join('\n           '));
    }
    
    // Job Postings
    const jobs = await prisma.jobPosting.findMany({ where: { deletedAt: null } });
    console.log(`\n💼 JOB POSTINGS: ${jobs.length} records`);
    if (jobs.length > 0) {
      console.log('   Sample:', jobs.slice(0, 3).map(j => `${j.title} - ${j.department} - ${j.status}`).join('\n           '));
    }
    
    // Candidates
    const candidates = await prisma.candidate.findMany({ where: { deletedAt: null } });
    console.log(`\n🎯 CANDIDATES: ${candidates.length} records`);
    if (candidates.length > 0) {
      console.log('   Sample:', candidates.slice(0, 3).map(c => `${c.name} - ${c.stage}`).join('\n           '));
    }
    
    // Conversations
    const conversations = await prisma.conversation.findMany({ where: { deletedAt: null } });
    console.log(`\n💬 CONVERSATIONS: ${conversations.length} records`);
    if (conversations.length > 0) {
      console.log('   Sample:', conversations.slice(0, 3).map(c => `${c.name} - unread: ${c.unread}`).join('\n           '));
    }
    
    // Messages
    const messages = await prisma.message.findMany({ where: { deletedAt: null } });
    console.log(`\n📨 MESSAGES: ${messages.length} records`);
    
    // Refresh Tokens
    const tokens = await prisma.refreshToken.findMany({ where: { revokedAt: null } });
    console.log(`\n🔑 ACTIVE REFRESH TOKENS: ${tokens.length} records`);
    
    // User Preferences
    const prefs = await prisma.userPreference.findMany();
    console.log(`\n⚙️  USER PREFERENCES: ${prefs.length} records`);
    
    console.log('\n================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
