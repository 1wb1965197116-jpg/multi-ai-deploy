let users = [];
let usage = {};

function createUser(username) {
  users.push({
    username,
    role: "free",
    subscribed: false
  });
}

function upgradeUser(username) {
  const user = users.find(u => u.username === username);
  if (user) {
    user.role = "paid";
    user.subscribed = true;
  }
}

function isPaid(username) {
  const user = users.find(u => u.username === username);
  return user && (user.subscribed || user.role === "admin");
}

function trackUsage(username) {
  if (!usage[username]) usage[username] = 0;
  usage[username]++;
}

function getStats() {
  return {
    totalUsers: users.length,
    paidUsers: users.filter(u => u.subscribed).length,
    usage
  };
}

module.exports = {
  createUser,
  upgradeUser,
  isPaid,
  trackUsage,
  getStats
};
