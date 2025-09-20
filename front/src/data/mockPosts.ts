export interface Tag {
  name: string;
  attribute: boolean;
}

export interface Comment {
  name: string;
  context: string;
  comment_time: string;
  post_id: string;
  comment_good: number;
}

export interface Post {
  user_name: string;
  prefectures: string;
  lat: number;
  lng: number;
  title: string;
  IconURL: string;
  discription: string;
  tag_list: Tag[];
  distribution_reward: number;
  direct_reward: number;
  post_time: string;
  post_limit: string;
  achivement: string;
  post_good: number;
  comment: Comment[];
}

export const mockPosts: Post[] = [
  {
    user_name: "田中太郎",
    prefectures: "大阪府",
    lat: 34.7024854,
    lng: 135.4937621,
    title: "公園の清掃プロジェクト",
    IconURL: "🌳",
    discription: "地域の公園にゴミが散乱しています。みんなで協力して美しい公園を取り戻しましょう！",
    tag_list: [
      { name: "環境", attribute: true },
      { name: "地域活動", attribute: false }
    ],
    distribution_reward: 300,
    direct_reward: 100,
    post_time: "2025-09-19T10:30:00Z",
    post_limit: "2025-09-25T23:59:59Z",
    achivement: "環境保護アチーブメント",
    post_good: 15,
    comment: [
      {
        name: "田中太郎",
        context: "素晴らしい取り組みですね！参加したいです。",
        comment_time: "2025-09-19T11:00:00Z",
        post_id: "post001",
        comment_good: 5
      },
      {
        name: "佐藤花子",
        context: "日曜日なら参加できます。時間を教えてください。",
        comment_time: "2025-09-19T14:30:00Z",
        post_id: "post001",
        comment_good: 3
      }
    ]
  },
  {
    user_name: "山田花子",
    prefectures: "京都府",
    lat: 34.7100000,
    lng: 135.5000000,
    title: "高齢者向けスマホ教室",
    IconURL: "📱",
    discription: "デジタルデバイドを解消し、高齢者の方にもスマートフォンを活用していただけるよう支援します。",
    tag_list: [
      { name: "教育", attribute: true },
      { name: "高齢者支援", attribute: false },
      { name: "デジタル", attribute: false }
    ],
    distribution_reward: 200,
    direct_reward: 150,
    post_time: "2025-09-18T15:20:00Z",
    post_limit: "2025-09-30T18:00:00Z",
    achivement: "デジタル支援アチーブメント",
    post_good: 8,
    comment: [
      {
        name: "山田次郎",
        context: "とても良い企画ですね。講師として協力できます。",
        comment_time: "2025-09-18T16:45:00Z",
        post_id: "post002",
        comment_good: 4
      }
    ]
  },
  {
    user_name: "佐藤一郎",
    prefectures: "兵庫県",
    lat: 34.6950000,
    lng: 135.4800000,
    title: "地域防災訓練の企画",
    IconURL: "🚨",
    discription: "災害に備えて、地域住民の防災意識を高める訓練を企画しています。避難経路の確認や応急手当の練習を行います。",
    tag_list: [
      { name: "防災", attribute: true },
      { name: "安全", attribute: true },
      { name: "地域活動", attribute: false }
    ],
    distribution_reward: 400,
    direct_reward: 200,
    post_time: "2025-09-17T09:15:00Z",
    post_limit: "2025-10-15T20:00:00Z",
    achivement: "地域安全アチーブメント",
    post_good: 22,
    comment: [
      {
        name: "鈴木一郎",
        context: "防災士の資格を持っています。お手伝いします！",
        comment_time: "2025-09-17T10:30:00Z",
        post_id: "post003",
        comment_good: 8
      },
      {
        name: "高橋美咲",
        context: "子供向けの防災教育も含めていただけますか？",
        comment_time: "2025-09-17T13:20:00Z",
        post_id: "post003",
        comment_good: 6
      },
      {
        name: "渡辺健太",
        context: "会場の手配について相談があります。",
        comment_time: "2025-09-18T08:45:00Z",
        post_id: "post003",
        comment_good: 2
      }
    ]
  }
];