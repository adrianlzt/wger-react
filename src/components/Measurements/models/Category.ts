import { Adapter } from "utils/Adapter";
import { MeasurementEntry } from "components/Measurements/models/Entry";

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

    constructor(
        public id: number,
        public name: string,
        public unit: string,
        public description: string,
        public code: string,
        entries?: MeasurementEntry[]
    ) {
        if (entries) {
            this.entries = entries;
        }
    }
}


export class MeasurementCategoryAdapter implements Adapter<MeasurementCategory> {
    fromJson(item: any) {
        return new MeasurementCategory(
            item.id,
            item.name,
            item.unit,
            item.description,
            item.code,
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            description: item.description,
            code: item.code,
        };
    }
}
