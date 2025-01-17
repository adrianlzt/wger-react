import axios from 'axios';
import { ExerciseVideo, ExerciseVideoAdapter } from "components/Exercises/models/video";
import { makeHeader, makeUrl } from "utils/url";

export const VIDEO_PATH = 'video';


/*
 * Post a new exercise video
 */
export const postExerciseVideo = async (exerciseBase: number, author: string, video: File): Promise<ExerciseVideo> => {
    const url = makeUrl(VIDEO_PATH);
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';

    // eslint-disable-next-line camelcase
    const response = await axios.post(
        url,
        // eslint-disable-next-line camelcase
        { exercise_base: exerciseBase, license_author: author, video: video },
        { headers: headers }
    );
    return new ExerciseVideoAdapter().fromJson(response.data);
};

/*
 * Delete an exercise video
 */
export const deleteExerciseVideo = async (videoId: number): Promise<number> => {
    const url = makeUrl(VIDEO_PATH, { id: videoId });
    const headers = makeHeader();
    const response = await axios.delete(url, { headers: headers });

    return response.status;
};
