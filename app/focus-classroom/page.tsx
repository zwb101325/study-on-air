import FocusScenePage from "../components/FocusScenePage";

export default function FocusClassroomPage() {
  return (
    <FocusScenePage
      active="classroom"
      theme="classroom"
      kicker="SELF STUDY · CLASS 07"
      title="专注课堂"
      description="黑板已经写好今天的目标。用一节课的时间关闭无关页面，跟随清晰节奏完成学习任务。"
      icon="✎"
      session="晚间自习课"
      details={[
        { label: "本节课", value: "40 min" },
        { label: "当前状态", value: "安静" },
        { label: "同桌人数", value: "156" },
      ]}
    />
  );
}
