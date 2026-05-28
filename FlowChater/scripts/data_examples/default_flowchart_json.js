const DefaultFlowchartJson = {
  "title": "穿戴式裝置 + 個案管理 + 排程通知 Dashboard / Wearable Device, Case Management & Scheduling Dashboard",
  "layout": {
    "direction": "left_to_right",
    "nodeWidth": 210,
    "nodeHeight": 82,
    "nodeGap": 72,
    "rankGap": 96,
    "canvasPadding": 64
  },
  "nodes": [
    {
      "id": "patient",
      "text": "病人\nPatient",
      "type": "rounded_rect",
      "rank": 0,
      "order": 0,
      "fill": "#e0f2fe",
      "stroke": "#0284c7"
    },
    {
      "id": "doctor",
      "text": "醫師 / 個管師\nDoctor / Case Manager",
      "type": "rounded_rect",
      "rank": 0,
      "order": 1,
      "fill": "#e0f2fe",
      "stroke": "#0284c7"
    },
    {
      "id": "case_profile",
      "text": "建立個案資料\nCase Profile",
      "type": "rounded_rect",
      "rank": 1,
      "order": 0,
      "fill": "#fef3c7",
      "stroke": "#d97706"
    },
    {
      "id": "care_plan",
      "text": "安排追蹤計畫\nCare Plan",
      "type": "rounded_rect",
      "rank": 1,
      "order": 1,
      "fill": "#fef3c7",
      "stroke": "#d97706"
    },
    {
      "id": "wearable_sync",
      "text": "穿戴式數據同步\nWearable Sync",
      "type": "rounded_rect",
      "rank": 2,
      "order": 0,
      "fill": "#dcfce7",
      "stroke": "#16a34a"
    },
    {
      "id": "dashboard",
      "text": "個案管理 Dashboard\nCase Dashboard",
      "type": "rounded_rect",
      "rank": 2,
      "order": 1,
      "fill": "#dcfce7",
      "stroke": "#16a34a"
    },
    {
      "id": "notification",
      "text": "排程通知\nSchedule Notification",
      "type": "rounded_rect",
      "rank": 2,
      "order": 2,
      "fill": "#dcfce7",
      "stroke": "#16a34a"
    },
    {
      "id": "followup",
      "text": "病人追蹤與回診\nFollow Up",
      "type": "rounded_rect",
      "rank": 3,
      "order": 0,
      "fill": "#fef3c7",
      "stroke": "#d97706"
    },
    {
      "id": "report",
      "text": "照護紀錄與報告\nCare Report",
      "type": "rounded_rect",
      "rank": 3,
      "order": 1,
      "fill": "#dcfce7",
      "stroke": "#16a34a"
    }
  ],
  "edges": [
    {
      "from": "doctor",
      "to": "case_profile"
    },
    {
      "from": "doctor",
      "to": "care_plan"
    },
    {
      "from": "patient",
      "to": "wearable_sync"
    },
    {
      "from": "case_profile",
      "to": "dashboard"
    },
    {
      "from": "care_plan",
      "to": "notification"
    },
    {
      "from": "wearable_sync",
      "to": "dashboard"
    },
    {
      "from": "notification",
      "to": "followup"
    },
    {
      "from": "dashboard",
      "to": "report"
    }
  ]
};
