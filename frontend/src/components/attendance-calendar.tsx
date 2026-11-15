import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type AttendanceCalendarProps = {
	selectedDate: Date;
	onSelectDate: (date: Date) => void;
};

export function AttendanceCalendar({
	selectedDate,
	onSelectDate,
}: AttendanceCalendarProps) {
	return (
		<Card className="w-fit max-w-full">
			<CardHeader className="border-b">
				<CardTitle>Calendar</CardTitle>
				<CardDescription>
					{format(selectedDate, "EEEE, MMMM d")}
				</CardDescription>
				<CardAction>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onSelectDate(new Date())}
					>
						Today
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="px-1">
				<Calendar
					mode="single"
					showOutsideDays={false}
					selected={selectedDate}
					onSelect={(date) => {
						if (date) {
							onSelectDate(date);
						}
					}}
				/>
			</CardContent>
		</Card>
	);
}
