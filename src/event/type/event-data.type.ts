export type EventData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  clubId: number | null;
  categoryId: number;
  startTime: Date;
  endTime: Date;
  maxPeople: number;
  eventCity: {
    id: number;
    cityId: number;
  }[];
};
