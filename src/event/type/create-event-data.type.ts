export type CreateEventData = {
  hostId: number;
  title: string;
  description: string;
  clubId?: number | null;
  categoryId: number;
  cityIds: number[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
