import type { CommunityPost } from "@/types/community";

const AVATAR = require("@/assets/mascotImages/maskot3dwhite.png");
const IMAGE_A = require("@/assets/mascotImages/daymascot3d.png");
const IMAGE_B = require("@/assets/mascotImages/Day.png");
const IMAGE_C = require("@/assets/images/daybg.png");
const IMAGE_E = require("@/assets/mascotImages/insightMascot.png");
const IMAGE_F = require("@/assets/mascotImages/calendarMascot.png");

/** Local mock assets until community posts API is connected. */
export type SimilarStoryMock = Omit<
  CommunityPost,
  "imageUrls" | "authorAvatarUrl"
> & {
  imageSources: number[];
  authorAvatarSource: number;
  tags: string[];
};

export const MOCK_SIMILAR_STORIES: SimilarStoryMock[] = [
  {
    postId: 1,
    matchScore: 96,
    imageSources: [IMAGE_A, IMAGE_B, IMAGE_C],
    authorName: "Anonymous",
    authorAvatarSource: AVATAR,
    categoryCode: "COUNSEL",
    categoryName: "Work",
    createdAt: "2026-04-18T09:30:00Z",
    title: "I thought I'd lose my job...",
    contentPreview:
      "For almost two months, I woke up every morning thinking today might be my last day...",
    likesCount: 482,
    commentsCount: 91,
    isLiked: true,
    isBookmarked: false,
    tags: ["Anxiety", "Work", "Sleep"],
  },
  {
    postId: 2,
    matchScore: 91,
    imageSources: [ IMAGE_E, IMAGE_F, IMAGE_A],
    authorName: "Anonymous",
    authorAvatarSource: AVATAR,
    categoryCode: "COUNSEL",
    categoryName: "Anxiety",
    createdAt: "2026-05-02T14:10:00Z",
    title: "Nights when my mind wouldn't stop",
    contentPreview:
      "I kept replaying conversations from work until sleep felt impossible. Writing one line helped.",
    likesCount: 318,
    commentsCount: 64,
    isLiked: false,
    isBookmarked: true,
    tags: ["Anxiety", "Sleep"],
  },
  {
    postId: 3,
    matchScore: 88,
    imageSources: [IMAGE_B, IMAGE_C, IMAGE_E],
    authorName: "Anonymous",
    authorAvatarSource: AVATAR,
    categoryCode: "KNOWLEDGE",
    categoryName: "Rest",
    createdAt: "2026-05-21T20:45:00Z",
    title: "Learning to rest without guilt",
    contentPreview:
      "I used to think rest meant giving up. Now I treat short breaks as part of staying well.",
    likesCount: 257,
    commentsCount: 42,
    isLiked: false,
    isBookmarked: false,
    tags: ["Rest", "SelfCare"],
  },
];
