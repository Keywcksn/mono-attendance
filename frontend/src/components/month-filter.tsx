import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type MonthFilterProps = {
	month: Date;
	onChange: (month: Date) => void;
};

export function MonthFilter({ month, onChange }: MonthFilterProps) {
	const isCurrent = isSameMonth(month, new Date());

	return (
		<div className="flex items-center gap-1">
			{!isCurrent && (
				<Button variant="ghost" size="sm" onClick={() => onChange(new Date())}>
					This month
				</Button>
			)}
			<Button
				variant="outline"
				size="icon"
				aria-label="Previous month"
				onClick={() => onChange(subMonths(month, 1))}
			>
				<ChevronLeft />
			</Button>
			<span className="min-w-28 text-center text-sm font-medium">
				{format(month, "MMMM yyyy")}
			</span>
			<Button
				variant="outline"
				size="icon"
				aria-label="Next month"
				disabled={isCurrent} // no future months
				onClick={() => onChange(addMonths(month, 1))}
			>
				<ChevronRight />
			</Button>
		</div>
	);
}
