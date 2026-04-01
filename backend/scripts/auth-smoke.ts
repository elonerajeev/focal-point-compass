import { authService } from "../src/services/auth.service";
import { prisma } from "../src/config/prisma";

async function main() {
  const email = `smoke-${Date.now()}@example.com`;
  const password = "Password123!";

  const signup = await authService.signup({
    name: "Smoke Test",
    email,
    password,
    role: "employee",
  });

  const login = await authService.login({ email, password });
  const me = await authService.me(signup.user.id, login.accessToken);

  await authService.logout(signup.user.id);

  console.log(
    JSON.stringify(
      {
        signup: signup.user.email,
        login: login.user.email,
        me: me.user.email,
        role: me.user.role,
        employeeId: me.user.employeeId,
      },
      null,
      2,
    ),
  );

  await prisma.refreshToken.deleteMany({ where: { userId: signup.user.id } });
  await prisma.user.delete({ where: { id: signup.user.id } });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
