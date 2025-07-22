module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/signup",
      handler: "user-account.create",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: "user-account.login",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/auth/update-passowrd",
      handler: "user-account.updatePassword",
      config: {
        auth: false,
      },
    },
  ],
};
