module.exports = [
  {
    script: "./bin/www",
    name: "ldstats",
    exec_mode: "cluster",
    instances: 1,
    env: {
      NODE_PATH: ".",
      DEBUG: "ldstats:*",
      PORT: 8080,
      GA_UAT: "UA-67782322-1",
    },
  },
];
