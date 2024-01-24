import { Adapter } from "utils/Adapter";
import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";

export class Day {

    sets: WorkoutSet[] = [];

    constructor(
        public id: number,
        public description: string,
        public daysOfWeek: number[],
        public decisionResult: boolean,
        public decisionStdout: string,
        sets?: WorkoutSet[]
    ) {
        if (sets) {
            this.sets = sets;
        }
    }
}


export class DayAdapter implements Adapter<Day> {
    fromJson(item: any): Day {
        return new Day(
            item.id,
            item.description,
            item.day,
            item.decision_result,
            item.decision_stdout,
        );
    }

    toJson(item: Day) {
        return {
            id: item.id,
            description: item.description,
            day: item.daysOfWeek,
            decision_result: item.decisionResult,
            decision_stdout: item.decisionStdout,
        };
    }
}
