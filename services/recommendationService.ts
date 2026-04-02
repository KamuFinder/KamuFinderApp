import axios from "axios";
const API_BASE_URL = "https://kamufinder-backend.onrender.com";


export const fetchStudyGroupRecommendations = async (
  userId,
  studyInterests,
  groups
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/recommend/study-groups`,
      {
        user_id: userId,
        study_interests: studyInterests,
        groups,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Virhe study group -suositusten haussa:", error);
    throw error;
  }
};



export type CandidateUser = {
  user_id: string;
  firstName?: string;
  city?: string;
  hobby_interests?: string[];
};

export type Recommendation = {
  user_id: string;
  firstName?: string;
  city?: string;
  hobby_interests?: string[];
  shared_hobbies?: string[];
  shared_count?: number;
  score: number;
};

type RecommendationResponse = {
  recommendations: Recommendation[];
};

export const fetchUserRecommendations = async (
  currentUserId: string,
  currentUserHobbies: string[],
  candidates: CandidateUser[]
): Promise<Recommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/recommend/users/hobby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_user_id: currentUserId,
      hobby_interests: currentUserHobbies,
      candidates,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recommendation request failed: ${errorText}`);
  }

  const data: RecommendationResponse = await response.json();
  return data.recommendations;
};