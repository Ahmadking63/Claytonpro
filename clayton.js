const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");
const maxThreads = 1; // số luồng
const user_agents = require("./config/userAgents");
const settings = require("./config/config");
const { sleep, getRandomNumber } = require("./utils");
const { checkBaseUrl } = require("./checkAPI");
# Banner
banner = """

▗▄▄▄▖ ▗▄▄▄▖  ▗▄▄▖ 
▐▌     ▐▌     ▐▌ ▐▌
▐▛▀▀▘ ▐▛▀▀▘  ▐▛▀▘ 
▐▌     ▐▙▄▄▖  ▐▌   
               
               
CREATE BY: FARUK EARNING POINT 
CONTRACT ON TELEGRAM: @FARUKKING63
TELEGRAM CHANEL: https://t.me FarukEarningPoint    
    
class Clayton {
  constructor(accountIndex, initData, session_name, baseURL) {
    this.accountIndex = accountIndex;
    this.initData = initData;
    this.headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      "Content-Type": "application/json",
      Origin: "https://tonclayton.fun",
      Referer: "https://tonclayton.fun/games",
      "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    };
    this.session_name = session_name;
    this.session_user_agents = this.#load_session_data();
    this.skipTasks = settings.SKIP_TASKS;
    this.wallets = this.loadWallets();
    this.baseURL = baseURL;
    this.multiplier = 1;
  }

  #load_session_data() {
    try {
      const filePath = path.join(process.cwd(), "session_user_agents.json");
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      } else {
        throw error;
      }
    }
  }

  #get_random_user_agent() {
    const randomIndex = Math.floor(Math.random() * user_agents.length);
    return user_agents[randomIndex];
  }

  #get_user_agent() {
    if (this.session_user_agents[this.session_name]) {
      return this.session_user_agents[this.session_name];
    }

    this.log(`Tạo user agent...`);
    const newUserAgent = this.#get_random_user_agent();
    this.session_user_agents[this.session_name] = newUserAgent;
    this.#save_session_data(this.session_user_agents);
    return newUserAgent;
  }

  #save_session_data(session_user_agents) {
    const filePath = path.join(process.cwd(), "session_user_agents.json");
    fs.writeFileSync(filePath, JSON.stringify(session_user_agents, null, 2));
  }

  #get_platform(userAgent) {
    const platformPatterns = [
      { pattern: /iPhone/i, platform: "ios" },
      { pattern: /Android/i, platform: "android" },
      { pattern: /iPad/i, platform: "ios" },
    ];

    for (const { pattern, platform } of platformPatterns) {
      if (pattern.test(userAgent)) {
        return platform;
      }
    }

    return "Unknown";
  }

  set_headers() {
    const platform = this.#get_platform(this.#get_user_agent());
    this.headers["sec-ch-ua"] = `"Not)A;Brand";v="99", "${platform} WebView";v="127", "Chromium";v="127`;
    this.headers["sec-ch-ua-platform"] = platform;
    this.headers["User-Agent"] = this.#get_user_agent();
  }

  loadWallets() {
    try {
      const walletFile = path.join(__dirname, "wallets.txt");
      if (fs.existsSync(walletFile)) {
        return fs.readFileSync(walletFile, "utf8").replace(/\r/g, "").split("\n").filter(Boolean);
      }
      return [];
    } catch (error) {
      this.log(`Lỗi khi đọc file wallet: ${error.message}`, "error");
      return [];
    }
  }

  async log(msg, type = "info") {
    const accountPrefix = `[ACCOUNT${this.accountIndex + 1}]`;
    let logMessage = "";

    switch (type) {
      case "success":
        logMessage = `${accountPrefix} ${msg}`.green;
        break;
      case "error":
        logMessage = `${accountPrefix} ${msg}`.red;
        break;
      case "warning":
        logMessage = `${accountPrefix} ${msg}`.yellow;
        break;
      default:
        logMessage = `${accountPrefix} ${msg}`.blue;
    }
    console.log(logMessage);
  }

  async makeRequest(url, method, data = {}) {
    const headers = { ...this.headers, "Init-Data": this.initData };
    let retries = 0,
      success = false;
    while (retries < 2 && !success) {
      retries++;
      try {
        const response = await axios({
          method,
          url,
          data,
          headers,
          timeout: 30000,
        });
        success = true;
        return { success: true, data: response.data };
      } catch (error) {
        if (error.status === 429) {
          this.log(`Too many requests waiting 2~3 minutes to try again: ${url}...`, "warning");
          await sleep([120, 180]);
        } else {
          this.log(`Request failed: ${url} | ${error.message} | trying again...`, "warning");
          await sleep(settings.DELAY_BETWEEN_REQUESTS);
        }
        success = false;
        return { success: false, error: error.message };
      }
    }
  }

  async login() {
    return this.makeRequest(`${this.baseURL}/user/authorization`, "post");
  }

  async dailyClaim() {
    return this.makeRequest(`${this.baseURL}/user/daily-claim`, "post");
  }

  async getPartnerTasks() {
    return this.makeRequest(`${this.baseURL}/tasks/partner-tasks`, "get");
  }

  async completePartnerTask(taskId) {
    return this.makeRequest(`${this.baseURL}/tasks/complete`, "post", { task_id: taskId });
  }

  async rewardPartnerTask(taskId) {
    return this.makeRequest(`${this.baseURL}/tasks/claim`, "post", { task_id: taskId });
  }

  async handlePartnerTasks() {
    let fetchAttempts = 0;
    const maxAttempts = 3;

    while (fetchAttempts < maxAttempts) {
      fetchAttempts++;
      const tasksResult = await this.getPartnerTasks();

      if (tasksResult.success) {
        const uncompletedTasks = tasksResult.data.filter((task) => !settings.SKIP_TASKS.includes(task.task_id) && !task.is_completed && !task.is_claimed);
        for (const task of uncompletedTasks) {
          this.log(`Bắt đầu nhiệm vụ ${task.task_id} | ${task.task.title}...`);

          let taskAttempts = 0;
          while (taskAttempts < maxAttempts) {
            taskAttempts++;
            await sleep(1);
            console.log(task);
            this.log(`Comleting ${task.task_id} | `);
            const completeResult = await this.completePartnerTask(task.task_id);
            if (completeResult.success) {
              const rewardResult = await this.rewardPartnerTask(task.task_id);
              if (rewardResult.success) {
                this.log(`Do task ${task.task_id} | ${task.task.title} succeeded. Receive ${task.task.reward_tokens} CL`, "success");
                break;
              }
            } else {
              if (taskAttempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
              }
            }
          }
          if (taskAttempts === maxAttempts) {
            this.log(`Task ${task.task.title} could not be completed after ${maxAttempts} attempts. Skip this mission.`, "warning");
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return;
      } else {
        if (fetchAttempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (fetchAttempts === maxAttempts) {
      this.log(`Unable to get partner task list after ${maxAttempts} attempts. Skip handling partner quests.`, "error");
    }
  }

  async getDailyTasks() {
    return this.makeRequest(`${this.baseURL}/tasks/daily-tasks`, "get");
  }

  async completeDailyTask(taskId) {
    return this.makeRequest(`${this.baseURL}/tasks/complete`, "post", { task_id: taskId });
  }

  async claimDailyTask(taskId) {
    return this.makeRequest(`${this.baseURL}/tasks/claim`, "post", { task_id: taskId });
  }

  async saveBalance() {
    return this.makeRequest(`${this.baseURL}/user/save-user`, "post");
  }

  async checkOGPass() {
    return this.makeRequest(`${this.baseURL}/pass/get`, "get");
  }

  async claimOGPass() {
    return this.makeRequest(`${this.baseURL}/pass/claim`, "post");
  }

  async handleDailyTasks() {
    let fetchAttempts = 0;
    const maxAttempts = 3;

    while (fetchAttempts < maxAttempts) {
      fetchAttempts++;
      const tasksResult = await this.getDailyTasks();
      const skipStack = settings.AUTO_PLAY_GAME_1204;
      const skip1204 = settings.AUTO_PLAY_GAME_STACK;

      if (tasksResult.success) {
        const uncompletedTasks = tasksResult.data.filter((task) => {
          const isTaskIdValid = skipStack ? task.task_id !== 4 : true;
          const isTaskId1204Valid = skip1204 ? task.task_id !== 3 : true;
          return !settings.SKIP_TASKS.includes(task.task_id) && !task.is_completed && !task.is_claimed && isTaskIdValid && isTaskId1204Valid;
        });
        for (const task of uncompletedTasks) {
          this.log(`Bắt đầu nhiệm vụ ${task.task_id} | ${task.task.title}...`);

          let taskAttempts = 0;
          while (taskAttempts < maxAttempts) {
            taskAttempts++;
            const completeResult = await this.completeDailyTask(task.task_id);
            if (completeResult.success) {
              const claimResult = await this.claimDailyTask(task.task_id);
              if (claimResult.success) {
                this.log(`Task ${task.task.title} completed successfully. Receive ${claimResult.data.reward_tokens} CL`, "success");
                this.log(`Total CL: ${claimResult.data.total_tokens} | Number of game plays: ${claimResult.data.game_attempts}`, "info");
                break;
              } else {
                this.log(`Unable to claim reward for task ${task.task.title}: ${claimResult.error || "Unknown error"}`, "error");
              }
            } else {
              if (taskAttempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
              }
            }
          }
          if (taskAttempts === maxAttempts) {
            this.log(`Task ${task.task.title} could not be completed after ${maxAttempts} attempts. Skip this mission.`, "warning");
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return;
      } else {
        if (fetchAttempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (fetchAttempts === maxAttempts) {
      this.log(`Unable to get daily task list after ${maxAttempts} attempts. Skip handling daily tasks.`, "error");
    }
  }

  async play2048() {
    const startGameResult = await this.makeRequest(`${this.baseURL}/game/start`, "post");
    if (!startGameResult.success || startGameResult.data.message !== "Game started successfully") {
      this.log("Unable to start 2048 game", "error");
      return;
    }

    this.log("The 2048 game has begun successfully", "success");

    const session_id = startGameResult.data.session_id;
    const fixedMilestones = [4, 8, 16, 32, 64, 128, 256, 512, 1024];
    const allMilestones = [...fixedMilestones].sort((a, b) => a - b);
    const gameEndTime = Date.now() + 150000;
    let maxTile = 2;
    for (const milestone of allMilestones) {
      if (Date.now() >= gameEndTime) break;
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000 + 5000));

      const saveGameResult = await this.makeRequest(`${this.baseURL}/game/save-tile`, "post", { maxTile: milestone, session_id });
      if (saveGameResult.success && saveGameResult.data.message === "MaxTile saved successfully") {
        maxTile = milestone;
        this.log(`The box has been reached${milestone}`, "success");
      }
    }
    await sleep(5);
    const endGameResult = await this.makeRequest(`${this.baseURL}/game/over`, "post", { maxTile, multiplier: this.multiplier, session_id });
    if (endGameResult.success) {
      const reward = endGameResult.data;
      this.log(`The 2048 game has ended successfully. Get ${reward.earn} CL and ${reward.xp_earned} XP`, "success");
    } else {
      this.log(`End Game Error 2048: ${endGameResult.error || "Unknown error"}`, "error");
    }
    await sleep(5);
  }

  async playStack() {
    const startGameResult = await this.makeRequest(`${this.baseURL}/stack/st-game`, "post");
    if (!startGameResult.success) {
      this.log("Unable to start game Stack", "error");
      return;
    }

    this.log("The Stack Game has begun successfully", "success");

    const gameEndTime = Date.now() + 120000;
    const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    let currentScoreIndex = 0;

    while (Date.now() < gameEndTime && currentScoreIndex < scores.length) {
      const score = scores[currentScoreIndex];
      // await sleep(5);
      const updateResult = await this.makeRequest(`${this.baseURL}/stack/update-game`, "post", { score });
      if (updateResult.success) {
        this.log(`Update Stack score: ${score}`, "success");
        currentScoreIndex++;
      } else {
        this.log(`Error updating Stack point: ${updateResult.error || "Unknown error"}`, "error");
      }

      await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000 + 5000));
    }

    const numberBonus = getRandomNumber(1, 9);
    const finalScore = (scores[currentScoreIndex - 1] || 90) + numberBonus;

    const endGameResult = await this.makeRequest(`${this.baseURL}/stack/en-game`, "post", { score: finalScore, multiplier: this.multiplier });
    if (endGameResult.success) {
      const reward = endGameResult.data;
      this.log(`The Stack game has ended successfully. Get ${reward.earn} CL and ${reward.xp_earned} XP`, "success");
    } else {
      this.log(`Stack game end error: ${endGameResult.error || "Unknown error"}`, "error");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  async playGames(tickets) {
    let currTicket = parseInt(tickets);
    while (currTicket > 0) {
      this.log(`Số vé hiện tại: ${currTicket}`, "info");
      if (settings.AUTO_PLAY_GAME_1204 && !settings.AUTO_PLAY_GAME_STACK) {
        await this.play2048();
      } else if (!settings.AUTO_PLAY_GAME_1204 && settings.AUTO_PLAY_GAME_STACK) {
        await this.playStack();
      } else {
        if (currTicket % 2 === 0) {
          await this.play2048();
        } else {
          await this.playStack();
        }
      }
      await sleep(5);
      currTicket--;
    }
  }

  async connectwallet(wallet) {
    if (!wallet) return this.log("Wallet address not found...ignore");
    const res = await this.makeRequest(`${this.baseURL}/user/wallet`, "post", { wallet });
    if (res?.data?.ok) {
      this.log(`Wallet connection successful: ${res.data.wallet}`.green);
    } else {
      this.log(`Unable to connect wallet, maybe the wallet is already linked to another account: ${res?.data?.error}`.yellow);
    }
  }

  async handleDefaultTasks() {
    let tasksResult;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      tasksResult = await this.makeRequest(`${this.baseURL}/tasks/default-tasks`, "get");

      if (tasksResult.success) {
        break;
      } else {
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (!tasksResult.success) {
      this.log(`Failed to get default task list after ${maxAttempts} attempts. Skipping default task handling.`, "error");      return;
    }

    const incompleteTasks = tasksResult.data.filter((task) => !settings.SKIP_TASKS.includes(task.task_id) && !task.is_completed);

    for (const task of incompleteTasks) {
      this.log(`Start task ${task.task_id} | ${task.task.title}...`);

      const completeResult = await this.makeRequest(`${this.baseURL}/tasks/complete`, "post", { task_id: task.task_id });

      if (!completeResult.success) {
        continue;
      }

      const claimResult = await this.makeRequest(`${this.baseURL}/tasks/claim`, "post", { task_id: task.task_id });

      if (claimResult.success) {
        const reward = claimResult.data;
        this.log(`Do task ${task.task_id} | ${task.task.title} succeeded. Rewards ${reward.reward_tokens} CL | Balance: ${reward.total_tokens}`, "success");
      } else {
        this.log(`Unable to receive rewards for quests ${task.task_id} | ${task.task.title}: ${claimResult.error || "Unknown error"}`, "error");
      }

      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000 + 2000));
    }
  }

  async handleSuperTasks() {
    let SuperTasks;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      SuperTasks = await this.makeRequest(`${this.baseURL}/tasks/super-tasks`, "get");

      if (SuperTasks.success) {
        break;
      } else {
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (!SuperTasks.success) {
      this.log(`"Intelligent ErrorUnable to get premium task list after ${maxAttempts} attempts. Skipping premium task processing.g defined"`, "error");
      return;
    }

    const incompleteTasks = SuperTasks.data.filter((task) => !settings.SKIP_TASKS.includes(task.task_id) && !task.is_completed);

    for (const task of incompleteTasks) {
      this.log(`Start mission ${task.task_id} | ${task.task.title}...`);

      const completeResult = await this.makeRequest(`${this.baseURL}/tasks/complete`, "post", { task_id: task.task_id });

      if (!completeResult.success) {
        continue;
      }

      const claimResult = await this.makeRequest(`${this.baseURL}/tasks/claim`, "post", { task_id: task.task_id });

      if (claimResult.success) {
        const reward = claimResult.data;
        this.log(`Task ${task.task.title} completed successfully. Reward ${reward.reward_tokens} CL | Balance: ${reward.total_tokens}`, "success");
      } else {
        this.log(`Unable to claim reward for task ${task.task.title}: ${claimResult.error || "Unknown error"}`, "error");
      }

      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000 + 2000));
    }
  }

  async processAccount() {
    let loginSuccess = false;
    let loginAttempts = 0;
    let loginResult;
    while (!loginSuccess && loginAttempts < 3) {
      loginAttempts++;
      this.log(`Login... (Attempt ${loginAttempts})`, "info");
      loginResult = await this.login();
      if (loginResult.success) {
        loginSuccess = true;
      } else {
        this.log(`Login failed: ${loginResult.error}`, "error");
        if (loginAttempts < 3) {
          this.log("Try again...", "info");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (!loginSuccess) {
      this.log("Login failed after 3 attempts. Abandoned account.", "error");
      return;
    }

    const userInfo = loginResult.data.user;
    this.log(`CL: ${userInfo.tokens} CL | ${userInfo.daily_attempts} Ticket | OGPass: ${userInfo.has_og_pass.toString()}`, "info");

    if (!userInfo.is_saved) {
      this.log("Protecting token...", "info");
      const saveResult = await this.saveBalance();
      if (saveResult.success) {
        this.log("Token protected successfully!", "success");
      } else {
        this.log(`Failed to save token: ${saveResult.error || "Unknown error"}`, "error");
      }
    }

    if (!userInfo.has_og_pass) {
      this.log("Checking OG PASS...", "info");
      const ogRes = await this.checkOGPass();
      if (ogRes.success && ogRes?.data?.can_claim_pass) {
        const claimRess = await this.claimOGPass();
        if (claimRess.success) {
          this.log("Obtained OG PASS successfully!", "success");
        }
      } else {
        this.log(`Not eligible for OG Pass yet!`, "warning");
      }
    } else {
      // this.multiplier = 1.25;
    }

    // process.exit(0);

    if (loginResult.data.dailyReward.can_claim_today) {
      this.log("Claim daily rewards...", "info");
      const claimResult = await this.dailyClaim();
      if (claimResult.success) {
        this.log("Daily reward successfully received!", "success");
      } else {
        this.log(`Unable to receive daily rewards: ${claimResult.error || "Unknown error"}`, "error");
      }
    }
    if (settings.CONNECT_WALLET) {
      await sleep(3);
      if (userInfo.wallet) {
        this.log(`Wallet linked account: ${userInfo.wallet}`);
      } else {
        this.log(`Start wallet link...`);
        await this.connectwallet(this.wallets[this.accountIndex]);
      }
    }

    if (settings.AUTO_PLAY_GAME) {
      await sleep(settings.DELAY_BETWEEN_GAME);
      let tickets = userInfo.daily_attempts;
      if (userInfo.daily_attempts > 0) {
        await this.playGames(tickets);
      } else {
        this.log(`No more game tickets`, "warning");
      }
    }

    if (settings.AUTO_TASK) {
      await sleep(3);
      await this.handleDefaultTasks();
      await sleep(3);
      await this.handlePartnerTasks();
      await sleep(3);
      await this.handleDailyTasks();
      await sleep(3);
      await this.handleSuperTasks();
    }
  }
}

async function wait(seconds) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r${colors.cyan(`[*] Chờ ${Math.floor(i / 60)} phút ${i % 60} giây để tiếp tục`)}`.padEnd(80));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  console.log(`Start new loop...`);
}

async function main() {
  console.log(colors.yellow("(https://t.me/D4rkCipherX)"));

  const { endpoint: hasIDAPI, message } = await checkBaseUrl();
  if (!hasIDAPI) return console.log(`Could not find API ID, try again later!`.red);
  console.log(`${message}`.yellow);

  const dataFile = path.join(__dirname, "data.txt");
  const data = fs.readFileSync(dataFile, "utf8").replace(/\r/g, "").split("\n").filter(Boolean);
  const waitTime = settings.TIME_SLEEP * 60 * 60;
  while (true) {
    for (let i = 0; i < data.length; i += maxThreads) {
      const batch = data.slice(i, i + maxThreads);

      const promises = batch.map(async (initData, indexInBatch) => {
        const accountIndex = i + indexInBatch;
        const userData = JSON.parse(decodeURIComponent(initData.split("user=")[1].split("&")[0]));
        const firstName = userData.first_name || "";
        const lastName = userData.last_name || "";
        const session_name = userData.id;

        console.log(`=========ACCOUNT ${accountIndex + 1}| ${firstName + " " + lastName}`.green);
        const client = new Clayton(accountIndex, initData, session_name, hasIDAPI);
        client.set_headers();

        return timeout(client.processAccount(), 60 * 60 * 1000).catch((err) => {
          client.log(`Account processing error: ${err.message}`, "error");
        });
      });
      await Promise.allSettled(promises);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    console.log(`Complete all accounts`);
    await wait(waitTime);
  }
}

function timeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
