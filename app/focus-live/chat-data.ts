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
];

// 聊天室中可能出现的评论，与 chatUsers 按相同下标组成预设消息。
export const chatComments: string[] = [
  "晚上好！今天播什么呀？",
  "前排坐好，等开播 ✨",
  "这个直播间也太舒服了",
  "声音很清楚～",
  "分享直播间，叫朋友一起来！",
  "来啦来啦，今晚不走了",
  "给主播点个关注 💗",
  "画面好有氛围感",
  "刚进来，先和大家打个招呼 👋",
  "主播晚上好，今天也来陪你啦",
  "这个画面好清晰！",
  "默默蹲在直播间听你聊天",
  "已分享给朋友，一起来玩～",
  "今天的氛围也太温柔了吧",
  "送你一颗小星星 ✨",
  "第一次来，已经点关注啦",
  "弹幕打卡！大家晚上好",
  "边做作业边听，陪伴感满满",
  "刚下课就赶来直播间啦",
  "主播记得喝水～",
  "这个直播间的颜色真好看",
  "已开启后台陪伴模式",
  "打卡！",
  "从推荐页来的，先关注一下",
  "晚上好呀",
  "今天也准时见面了",
  "画质很稳，点赞",
  "安静听你聊天就很开心",
];

const presetMessages: ChatMessage[] = chatUsers.map((user, index) => ({
  id: index + 1,
  user: user.id,
  text: chatComments[index],
  color: user.color,
  accent: user.accent,
}));

export const initialMessages = presetMessages.slice(0, 8);

export const liveComments = presetMessages.slice(8).map(({ user, text, color }) => ({
  user,
  text,
  color,
}));
