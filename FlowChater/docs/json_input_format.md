# FlowChater JSON input format

FlowChater reads one JSON object with `title`, `layout`, `nodes`, and `edges`.

```json
{
  "title": "補助計畫審核流程 / Grant Review Flow",
  "layout": {
    "direction": "left_to_right",
    "nodeWidth": 190,
    "nodeHeight": 78,
    "nodeGap": 56,
    "rankGap": 96,
    "canvasPadding": 70
  },
  "nodes": [
    {
      "id": "submit",
      "text": "申請人送出資料\nSubmit application",
      "type": "rounded_rect",
      "rank": 0,
      "order": 0
    }
  ],
  "edges": [
    {
      "from": "submit",
      "to": "review"
    }
  ]
}
```

## Layout

- `direction`: `left_to_right` or `top_to_bottom`
- `nodeWidth`: default block width in preview pixels
- `nodeHeight`: default block height in preview pixels
- `nodeGap`: gap between nodes in the same rank
- `rankGap`: gap between ranks
- `canvasPadding`: outer margin

## Nodes

- `id`: unique node id
- `text`: displayed text, supports Chinese, English, and `\n` line breaks
- `type`: `rounded_rect`, `rectangle`, `diamond`, or `circle`
- `rank`: layer position, such as 0, 1, 2
- `order`: order inside the same rank
- `width` / `height`: optional per-node size override
- `fill` / `stroke`: optional per-node colors

## Edges

- `from`: source node id
- `to`: target node id

Edges do not display text. Put all visible wording inside `nodes[].text` so the layout stays predictable.

If `rank` is not provided, FlowChater estimates ranks from edge direction.
