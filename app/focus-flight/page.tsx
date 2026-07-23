import FocusScenePage from "../components/FocusScenePage";

export default function FocusFlightPage() {
  return (
    <FocusScenePage
      active="flight"
      theme="flight"
      kicker="WANFENG AIR · WF0723"
      title="专注航班"
      description="请将分心事项调至飞行模式。本次航程预计 45 分钟，目的地是完成今天最重要的一件事。"
      icon="✈"
      session="前往完成之城"
      details={[
        { label: "预计航程", value: "45 min" },
        { label: "巡航状态", value: "平稳" },
        { label: "同行旅客", value: "328" },
      ]}
    />
  );
}
