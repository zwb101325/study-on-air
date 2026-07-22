import FocusScenePage from "../components/FocusScenePage";

export default function FocusCafePage() {
  return (
    <FocusScenePage
      active="cafe"
      theme="cafe"
      kicker="WANFENG COFFEE · OPEN LATE"
      title="专注咖啡馆"
      description="找一个靠窗的位置，让柔和的氛围陪你读完几页书、写下一段文字，或者慢慢整理思绪。"
      icon="☕"
      session="晚风靠窗座"
      details={[
        { label: "推荐时长", value: "25 min" },
        { label: "环境音", value: "轻柔" },
        { label: "空闲座位", value: "12" },
      ]}
    />
  );
}
