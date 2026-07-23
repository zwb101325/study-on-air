// ============================================================
// #region 聊天数据类型
// ============================================================

export type ChatUser = {
  id: string;
  color?: string;
  accent?: boolean;
};

export type ChatMessage = {
  id: number;
  user: string;
  text: string;
  accent?: boolean;
  joined?: boolean;
  color?: string;
};

// #endregion



// ============================================================
// #region 聊天室用户 ID
// ============================================================

// 聊天室中可能出现的用户 ID。颜色用于右侧聊天室中的用户名显示。
export const chatUsers: ChatUser[] = [
  { id: "柚子汽水", color: "#8b72d7" },
  { id: "bili_70241986", color: "#5b8fd1" },
  { id: "南方来信·第七页", color: "#b05eac" },
  { id: "NeoCat", color: "#2c9d8a" },
  { id: "橘猫团长", accent: true },
  { id: "晚风收藏家协会会长", color: "#d0783f" },
  { id: "汽水半糖", color: "#df5f91" },
  { id: "一颗小星星", color: "#6f7fc8" },
  { id: "云朵面包", color: "#8b72d7" },
  { id: "蓝莓星球", color: "#5c83ce" },
  { id: "白桃乌龙", color: "#d45f91" },
  { id: "北极甜虾", color: "#9b6cc0" },
  { id: "奶油小熊", color: "#c87242" },
  { id: "银河便利店", color: "#5487b8" },
  { id: "海盐芝士", color: "#289b89" },
  { id: "春日来信", color: "#b75a9c" },
  { id: "草莓软糖", color: "#e05e7d" },
  { id: "毛绒月亮", color: "#7768c6" },
  { id: "bili_92602771446", color: "#4c86be" },
  { id: "今天也要早睡呀", color: "#cd654f" },
  { id: "雾岛听风", color: "#6577bd" },
  { id: "一颗柠檬薄荷糖", color: "#249a79" },
  { id: "Rin", color: "#c15fa6" },
  { id: "星河漫游指南第42页", color: "#9a68c8" },
  { id: "小岛", color: "#dd6b8d" },
  { id: "纸飞机飞过晚霞", color: "#d07c3e" },
  { id: "user_0x7F", color: "#3e91a5" },
  { id: "住在月亮背面的人", color: "#765fc2" },
  { id: "月光邮差", color: "#8d6ac8" },
  { id: "玻璃汽水铺", color: "#3f9aac" },
  { id: "bili_348291076", color: "#4f80c9" },
  { id: "Lavender_17", color: "#9b67b9" },
  { id: "躲进云里的猫", color: "#cc668d" },
  { id: "南极观星员", color: "#527eb6" },
  { id: "橙子海岸线", color: "#d77a45" },
  { id: "晚睡研究所", color: "#755fc1" },
  { id: "momo_Study", color: "#c15a96" },
  { id: "夏夜萤火虫", color: "#2f9a81" },
  { id: "纸船慢慢漂", color: "#607bc4" },
  { id: "user_7A3C", color: "#3c91a2" },
  { id: "长岛冰茶不加冰", color: "#cb6d4b" },
  { id: "十三月的来信", color: "#a45ea8" },
  { id: "北纬31度的风", color: "#537fb4" },
  { id: "小熊饼干事务所", color: "#c27645" },
  { id: "安静自习中", color: "#6b72bd" },
  { id: "bili_1048576", color: "#4689bd" },
  { id: "MoonlitDesk", color: "#8065c3" },
  { id: "青柠苏打水", color: "#26977b" },
  { id: "住在星河入口", color: "#685fc0" },
  { id: "冬日热可可", color: "#bd6c50" },
  { id: "鹿屿森川", color: "#358f83" },
  { id: "TodayFocus", color: "#526fc3" },
  { id: "风吹过第九站", color: "#8070bd" },
  { id: "鲸落在凌晨三点", color: "#4786aa" },
  { id: "咖啡加半块糖", color: "#b56f4f" },
  { id: "bili_5201314", color: "#d05f8e" },
  { id: "山茶花未眠", color: "#c45882" },
  { id: "一只路过的团子", color: "#a36aaf" },
  { id: "StudyWithMe_24", color: "#497dbd" },
  { id: "云端收信人", color: "#7467c2" },
];

// #endregion



// ============================================================
// #region 通用聊天室评论
// ============================================================

export type ChatTimePeriod = "midnight" | "morning" | "afternoon" | "evening";

export const morningChatComments: string[] = [
  "早上好，新的一天一起加油",
  "早起打卡，今天也要认真学习 ✨",
  "晨间直播的氛围真舒服",
  "先喝口水，再开始今天的计划",
  "早安！今天准备完成什么任务？",
  "刚吃完早餐，来直播间报到",
  "上午的状态看起来很不错",
  "今天也从一个小目标开始吧",
  "阳光正好，适合安静专注",
  "早上好，先把最重要的事情完成",
  "晨间专注模式启动",
  "起床后第一件事就是来打卡",
  "新的一天已经顺利开始啦",
  "上午效率通常最高，一起冲",
  "桌面收拾好了，准备开始学习",
  "早起的人已经领先一小步啦",
  "今天的第一杯水喝了吗？",
  "先完成上午计划，再安心休息",
  "早安弹幕从屏幕前飘过 👋",
  "今天也要保持稳定的学习节奏",
  "晨光陪伴模式已开启",
  "上午好，慢慢进入状态就可以",
  "第一项任务已经写在清单上了",
  "早起学习真的很有成就感",
];


export const afternoonChatComments: string[] = [
  "下午好，午后的专注时间开始啦",
  "吃完午饭回来继续打卡",
  "下午容易犯困，先伸个懒腰吧",
  "午后也要保持稳定的节奏",
  "下午好，今天的任务完成多少了？",
  "泡杯茶，继续处理手上的事情",
  "这个下午一起安静学习吧",
  "午后阳光看起来好温柔",
  "先完成一小段，再起来活动一下",
  "下午场准时报到 ✨",
  "困的时候喝口水会清醒一点",
  "今天的进度正在慢慢增加",
  "下午继续努力，晚上就能轻松一些",
  "午休结束，重新进入专注状态",
  "这个时间段很适合整理笔记",
  "下午好，来直播间找一点动力",
  "已经完成上午计划，继续冲下午",
  "专注一会儿，再奖励自己休息",
  "午后的陪伴感也很舒服",
  "大家下午好，一起完成今天的目标",
  "先把最难的部分解决掉吧",
  "下午的咖啡已经准备好了",
  "跟着直播间节奏慢慢推进",
  "今天还没有结束，继续加油",
];


export const eveningChatComments: string[] = [
  "晚上好！今天也来一起专注",
  "晚间打卡，今天的计划收个尾 ✨",
  "这个直播间的夜晚氛围真舒服",
  "晚上好，先和大家打个招呼 👋",
  "忙完一天，终于可以安静学习了",
  "今晚准备一起专注多久？",
  "夜间陪伴模式已开启",
  "把今天剩下的任务稳稳完成吧",
  "晚上学习记得保护眼睛",
  "主播晚上好，今天也来陪你啦",
  "这个时间段直播刚刚好",
  "戴上耳机以后氛围更好了",
  "晚上的桌面已经收拾好啦",
  "今天最后一个目标，加油完成",
  "夜猫子准时报到",
  "安静挂在直播间一起学习",
  "晚上好，记得偶尔喝口水",
  "今天辛苦了，再坚持一小会儿",
  "睡前把手上的内容整理完",
  "夜晚的专注时间开始啦",
  "凌晨党在这里集合",
  "咖啡续上，继续写作业",
  "完成今天的计划就早点休息吧",
  "收到今晚的陪伴信号",
];

export const midnightChatComments: string[] = [
  "凌晨好，还在努力的人辛苦啦",
  "夜深了，完成这一小段就早点休息吧",
  "凌晨打卡，安静陪你一会儿",
  "这个时间还在专注，真的很有毅力",
  "夜已经很深了，记得照顾好自己",
  "凌晨的直播间格外安静",
  "如果困了就不要勉强，休息也很重要",
  "完成手上的内容就准备睡觉吧",
  "深夜陪伴模式已开启",
  "凌晨党来直播间报到",
  "屏幕亮度可以稍微调低一点",
  "这么晚还在努力，给你点个赞",
  "记得喝口水，也让眼睛休息一下",
  "深夜的专注时间开始啦",
  "再坚持一小会儿就去休息吧",
  "安静的凌晨很适合整理思路",
  "今天辛苦了，不要给自己太大压力",
  "夜猫子轻轻路过直播间",
  "凌晨学习也要注意坐姿",
  "完成最后一项任务就收工",
  "陪你度过这一段安静的深夜",
  "现在的努力会慢慢积累成成果",
  "夜深了，困的时候及时休息",
  "收到凌晨的陪伴信号",
];


export function getChatTimePeriod(date = new Date()): ChatTimePeriod {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18) return "evening";
  return "midnight";
}

export function getCurrentChatComments(date = new Date()) {
  const period = getChatTimePeriod(date);
  if (period === "morning") return morningChatComments;
  if (period === "afternoon") return afternoonChatComments;
  if (period === "evening") return eveningChatComments;
  return midnightChatComments;
}

// #endregion



// ============================================================
// #region 学习阶段评论
// ============================================================

// 连续超过 10 秒没有检测到人物时持续使用，直到人物重新出现。
export const personAwayComments: string[] = [
  "主播去哪里啦？",
  "人呢？镜头前怎么空了",
  "暂时离开座位了吗？",
  "回来继续一起学习呀",
  "镜头里没人，是去休息了吗？",
  "人在哪里？我们还在等你",
  "座位空空的，主播快回来",
  "是不是去接水啦？",
  "离开一小会儿也要记得回来哦",
  "镜头前没人啦，大家先等等",
  "休息好以后继续一起专注吧",
  "主播暂时离开画面了吗？",
];

// 开播 0～10 分钟使用。
export const welcomeStudyComments: string[] = [
  "欢迎开播，今天也一起专注吧",
  "刚开始学习，先定个小目标吧",
  "新一轮专注开始啦，加油",
  "欢迎回来，慢慢进入状态",
  "今天的学习时间从现在开始",
  "前一分钟打卡，陪你一起开始",
  "准备好了吗？一起专注",
  "开播成功，今晚也要稳稳学习",
  "第一分钟先调整好坐姿吧",
  "欢迎来到今天的专注时间",
  "刚刚开始也很棒，一步一步来",
  "把手机放远一点，我们开始吧",
];

// 开播 10～20 分钟使用。
export const lightFocusComments: string[] = [
  "已经专注十分钟啦，状态开始稳定了",
  "十分钟热身完成，继续保持这个节奏",
  "慢慢进入状态了，加油",
  "刚才这十分钟完成得很不错",
  "专注模式已经启动，继续向前",
  "第一个十分钟打卡成功",
  "保持现在的坐姿和节奏就很好",
  "看起来已经认真起来啦",
  "再完成一小段就更棒了",
  "开头最难的部分已经坚持过来了",
  "状态不错，继续完成眼前这一项",
  "轻度专注阶段达成，稳稳继续",
];

// 开播 20～30 分钟使用。
export const mediumFocusComments: string[] = [
  "已经专注二十分钟，状态越来越好了",
  "二十分钟打卡，今天很有执行力",
  "进入深一点的专注状态啦",
  "保持住，离这轮目标又近了一步",
  "认真学习的样子很棒",
  "这段专注时间很有价值",
  "节奏很稳定，继续完成手上的内容",
  "已经坚持两段十分钟啦",
  "注意放松肩膀，然后继续努力",
  "中等专注阶段达成，表现不错",
  "今天的学习进度正在稳步增加",
  "继续保持，马上就到半小时了",
];

// 开播 30 分钟以上使用。
export const longFocusComments: string[] = [
  "已经坚持半小时啦，真的很棒",
  "长时间专注达成，给你点个赞",
  "半小时打卡成功，今天状态很好",
  "坚持这么久很不容易，继续加油",
  "已经进入长时间专注状态了",
  "保持专注的同时也记得眨眨眼",
  "完成这一小段后可以起来活动一下",
  "你的持续专注正在慢慢积累成果",
  "今天的学习耐力很不错",
  "已经稳稳学习很久啦，辛苦了",
  "长时间保持状态，执行力拉满",
  "继续按自己的节奏完成今天的目标",
];

// #endregion



// ============================================================
// #region 初始消息与自动评论数据
// ============================================================

function createTimeBasedMessages(date = new Date()): ChatMessage[] {
  const currentComments = getCurrentChatComments(date);
  return chatUsers.map((user, index) => ({
    id: index + 1,
    user: user.id,
    text: currentComments[index % currentComments.length],
    color: user.color,
    accent: user.accent,
  }));
}

export function getInitialMessages(date = new Date()) {
  return createTimeBasedMessages(date).slice(0, 8);
}

export function getLiveComments(date = new Date()) {
  return createTimeBasedMessages(date).slice(8).map(({ user, text, color }) => ({
    user,
    text,
    color,
  }));
}

// #endregion
