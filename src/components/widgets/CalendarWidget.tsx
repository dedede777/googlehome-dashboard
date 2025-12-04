"use client";

export default function CalendarWidget() {
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">CALENDAR</div>
            <div className="flex-1 p-2 overflow-auto min-h-0">
                <div className="grid grid-cols-7 gap-1 text-[9px] text-[#666]">
                    {days.map((day) => (
                        <div
                            key={day}
                            className={`text-center py-0.5 ${day === today ? "bg-[#4a4a4a] text-white" : ""}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
