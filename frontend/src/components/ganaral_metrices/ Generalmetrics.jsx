import './Dashboardmetrics.css';

/* ============================================================
   Small reusable pieces — imported individually by the
   student / trainer / moderator / admin files, and also
   composed together below into <GeneralMetrics />.
   ============================================================ */

export function KPICard({ label, value, unit, sub, subTrend }) {
    return (
        <div className="metricCard">
            <span className="metricCardLabel">{label}</span>
            <span className="metricCardValue">
                {value}
                {unit && <span>{unit}</span>}
            </span>
            {sub && (
                <span
                    className={`metricCardSub ${
                        subTrend === "up" ? "up" : subTrend === "down" ? "down" : ""
                    }`}
                >
                    {sub}
                </span>
            )}
        </div>
    );
}

/* data: [{ label, value }], value expected 0-100 unless max is passed */
// export function BarChart({ title, meta, data = [], max, valueSuffix = "%" }) {
//     const computedMax = max || Math.max(1, ...data.map((d) => d.value));

//     return (
//         <div className="chartCard bar_chart">
//             <div className="chartCardHeader">
//                 <span className="chartCardTitle">{title}</span>
//                 {/* {meta && <span className="chartCardMeta">{meta}</span>} */}
//             </div>

//             {data.length === 0 ? (
//                 <div className="metricsEmpty">No data yet</div>
//             ) : (
//                 <div className="barChart">
//                     {data.map((d, i) => (
//                         <div className="barChartCol" key={d.label + i}>
//                             <span className="barChartValue">
//                                 {d.value}
//                                 {valueSuffix}
//                             </span>
//                             <div className="barChartTrack">
//                                 <div
//                                     className="barChartFill"
//                                     style={{
//                                         height: `${Math.min(
//                                             100,
//                                             (d.value / computedMax) * 100
//                                         )}%`,
//                                     }}
//                                 />
//                             </div>
//                             <span className="barChartLabel">{d.label}</span>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }
// export function BarChart({
//     title,
//     meta,
//     data = [],
//     max,
//     valueSuffix = "%",
// }) {
//     const computedMax =
//         max ?? Math.max(1, ...data.map((d) => Number(d.value) || 0));

//     return (
//         <div className="chartCard bar_chart">
//             <div className="chartCardHeader">
//                 <div>
//                     <div className="chartCardTitle">{title}</div>
//                     {meta && (
//                         <div className="chartCardMeta">{meta}</div>
//                     )}
//                 </div>
//             </div>

//             {data.length === 0 ? (
//                 <div className="metricsEmpty">No data yet</div>
//             ) : (
//                 <div className="barChart">
//                     {/* subtle horizontal guide lines */}
//                     <div className="barChartGrid">
//                         <span style={{ bottom: "100%" }}>
//                             {computedMax}{valueSuffix}
//                         </span>

//                         <span style={{ bottom: "75%" }}>
//                             {Math.round(computedMax * 0.75)}
//                             {valueSuffix}
//                         </span>

//                         <span style={{ bottom: "50%" }}>
//                             {Math.round(computedMax * 0.5)}
//                             {valueSuffix}
//                         </span>

//                         <span style={{ bottom: "25%" }}>
//                             {Math.round(computedMax * 0.25)}
//                             {valueSuffix}
//                         </span>
//                     </div>

//                     <div className="barChartBars">
//                         {data.map((d, i) => {
//                             const value = Number(d.value) || 0;

//                             const height = Math.min(
//                                 100,
//                                 (value / computedMax) * 100
//                             );

//                             return (
//                                 <div
//                                     className="barChartCol"
//                                     key={`${d.label}-${i}`}
//                                 >
//                                     <div className="barChartValue">
//                                         {d.value}
//                                         {valueSuffix}
//                                     </div>

//                                     <div className="barChartArea">
//                                         <div
//                                             className="barChartFill"
//                                             style={{
//                                                 height: `${height}%`,
//                                             }}
//                                         />
//                                     </div>

//                                     <div className="barChartLabel">
//                                         {d.label}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



export function BarChart({
    title,
    meta,
    data = [],
    max,
    valueSuffix = "%",
}) {
    const computedMax =
        max ?? (valueSuffix === "%" ? 100 : Math.max(1, ...data.map((d) => Number(d.value) || 0)));

    return (
        <div className="chartCard bar_chart">
            <div className="chartCardHeader">
                <div>
                    <div className="chartCardTitle">{title}</div>

                    {meta && (
                        <div className="chartCardMeta">{meta}</div>
                    )}
                </div>
            </div>

            {data.length === 0 ? (
                <div className="metricsEmpty">
                    No data yet
                </div>
            ) : (
                <div className="barChart">

                    <div className="barChartGrid">
                        <span style={{ bottom: "100%" }}>
                            100{valueSuffix}
                        </span>

                        <span style={{ bottom: "75%" }}>
                            75{valueSuffix}
                        </span>

                        <span style={{ bottom: "50%" }}>
                            50{valueSuffix}
                        </span>

                        <span style={{ bottom: "25%" }}>
                            25{valueSuffix}
                        </span>
                    </div>

                    <div className="barChartBars">
                        {data.map((d, i) => {
                            const value = Number(d.value) || 0;

                            const height = Math.min(
                                100,
                                (value / computedMax) * 100
                            );

                            return (
                                <div
                                    className="barChartCol"
                                    key={`${d.label}-${i}`}
                                >
                                    <div className="barChartValue">
                                        {value}
                                        {valueSuffix}
                                    </div>

                                    <div className="barChartArea">
                                        <div
                                            className="barChartFill"
                                            style={{
                                                height: `${height}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="barChartLabel">
                                        {d.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
}
/* data: [{ label, value }] — smooth-ish trend line */
export function LineChart({ title, meta, data = [], valueSuffix = "%" }) {
    const width = 100;
    const height = 100;
    const max = Math.max(1, ...data.map((d) => d.value));
    const min = Math.min(0, ...data.map((d) => d.value));
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
        const y = height - ((d.value - min) / range) * height;
        return { x, y, ...d };
    });

    const pathD = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

    const areaD =
        points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
            : "";

    return (
        <div className="chartCard">
            <div className="chartCardHeader">
                <span className="chartCardTitle">{title}</span>
                {meta && <span className="chartCardMeta">{meta}</span>}
            </div>

            {data.length === 0 ? (
                <div className="metricsEmpty">No data yet</div>
            ) : (
                <>
                    <svg
                        className="lineChartSvg"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                    >
                        {areaD && <path className="lineChartArea" d={areaD} />}
                        <path className="lineChartPath" d={pathD} vectorEffect="non-scaling-stroke" />
                        {points.map((p, i) => (
                            <circle
                                key={i}
                                className="lineChartDot"
                                cx={p.x}
                                cy={p.y}
                                r="1.6"
                            />
                        ))}
                    </svg>
                    <div className="lineChartAxisLabels">
                        <span>{data[0]?.label}</span>
                        <span>{data[data.length - 1]?.label}</span>
                    </div>
                </>
            )}
        </div>
    );
}

/* years: [{ year, attendance, performance, hours }]
   hours is scaled against its own max since it's not a percentage */
// export function YearTimeline({ title = "Year-wise timeline", years = [] }) {
//     const maxHours = Math.max(1, ...years.map((y) => y.hours || 0));

//     const series = [
//         { key: "attendance", color: "#f1af07", label: "Attendance %" },
//         { key: "performance", color: "#4f8ef7", label: "Performance %" },
//         { key: "hours", color: "#9b6bd6", label: "Hours delivered" },
//     ];

//     return (
//         <div className="chartCard">
//             <div className="chartCardHeader">
//                 <span className="chartCardTitle">{title}</span>
//             </div>

//             {years.length === 0 ? (
//                 <div className="metricsEmpty">No sessions found across years yet</div>
//             ) : (
//                 <>
//                     <div className="barChart">
//                         {years.map((y) => (
//                             <div className="barChartCol" key={y.year}>
//                                 <div className="barChartGroup">
//                                     <div className="barChartTrack">
//                                         <div
//                                             className="barChartFill"
//                                             style={{
//                                                 height: `${y.attendance || 0}%`,
//                                                 background: series[0].color,
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="barChartTrack">
//                                         <div
//                                             className="barChartFill"
//                                             style={{
//                                                 height: `${y.performance || 0}%`,
//                                                 background: series[1].color,
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="barChartTrack">
//                                         <div
//                                             className="barChartFill"
//                                             style={{
//                                                 height: `${
//                                                     ((y.hours || 0) / maxHours) * 100
//                                                 }%`,
//                                                 background: series[2].color,
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                                 <span className="barChartLabel">{y.year}</span>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="barChartLegend">
//                         {series.map((s) => (
//                             <div className="barChartLegendItem" key={s.key}>
//                                 <span
//                                     className="barChartLegendDot"
//                                     style={{ background: s.color }}
//                                 />
//                                 {s.label}
//                             </div>
//                         ))}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }
export function YearTimeline({ title = "Year-wise timeline", years = [] }) {
    const maxHours = Math.max(1, ...years.map((y) => y.hours || 0));

    const series = [
        {
            key: "attendance",
            color: "#f1af07",
            label: "Attendance",
        },
        {
            key: "performance",
            color: "#4f8ef7",
            label: "Performance",
        },
        {
            key: "hours",
            color: "#9b6bd6",
            label: "Hours delivered",
        },
    ];

    return (
        // <div className="chartCard yearTimeline">
        //     <div className="chartCardHeader">
        //         <div>
        //             <span className="chartCardTitle">{title}</span>
        //             <span className="chartCardSubtitle">
        //                 Performance across academic years
        //             </span>
        //         </div>
        //     </div>

        //     {years.length === 0 ? (
        //         <div className="metricsEmpty">
        //             No sessions found across years yet
        //         </div>
        //     ) : (
        //         <>
        //             <div className="timelineChart">
        //                 {/* Grid labels */}
        //                 <div className="timelineGrid">
        //                     <span>100</span>
        //                     <span>75</span>
        //                     <span>50</span>
        //                     <span>25</span>
        //                     <span>0</span>
        //                 </div>

        //                 {/* Plot */}
        //                 <div className="timelinePlot">
        //                     {/* Horizontal grid */}
        //                     <div className="timelineGridLines">
        //                         <span />
        //                         <span />
        //                         <span />
        //                         <span />
        //                         <span />
        //                     </div>

        //                     {years.map((y) => {
        //                         const attendance = Math.min(
        //                             100,
        //                             Math.max(0, Number(y.attendance) || 0)
        //                         );

        //                         const performance = Math.min(
        //                             100,
        //                             Math.max(0, Number(y.performance) || 0)
        //                         );

        //                         const hours = Math.min(
        //                             100,
        //                             Math.max(
        //                                 0,
        //                                 ((Number(y.hours) || 0) / maxHours) * 100
        //                             )
        //                         );

        //                         const bars = [
        //                             {
        //                                 value: attendance,
        //                                 display: `${y.attendance || 0}%`,
        //                                 className: "attendance",
        //                             },
        //                             {
        //                                 value: performance,
        //                                 display: `${y.performance || 0}%`,
        //                                 className: "performance",
        //                             },
        //                             {
        //                                 value: hours,
        //                                 display: `${y.hours || 0}h`,
        //                                 className: "hours",
        //                             },
        //                         ];

        //                         return (
        //                             <div
        //                                 className="timelineYear"
        //                                 key={y.year}
        //                             >
        //                                 <div className="timelineBars">
        //                                     {bars.map((bar) => (
        //                                         <div
        //                                             className={`timelineBarWrap ${bar.className}`}
        //                                             key={bar.className}
        //                                         >
        //                                             <span className="timelineValue">
        //                                                 {bar.display}
        //                                             </span>

        //                                             <div className="timelineBar">
        //                                                 <div
        //                                                     className="timelineBarFill"
        //                                                     style={{
        //                                                         height: `${bar.value}%`,
        //                                                     }}
        //                                                 />
        //                                             </div>
        //                                         </div>
        //                                     ))}
        //                                 </div>

        //                                 <span className="timelineYearLabel">
        //                                     {y.year}
        //                                 </span>
        //                             </div>
        //                         );
        //                     })}
        //                 </div>
        //             </div>

        //             <div className="timelineLegend">
        //                 {series.map((s) => (
        //                     <div
        //                         className="timelineLegendItem"
        //                         key={s.key}
        //                     >
        //                         <span
        //                             className={`timelineLegendDot ${s.key}`}
        //                         />

        //                         <span>{s.label}</span>
        //                     </div>
        //                 ))}
        //             </div>
        //         </>
        //     )}
        // </div>
        <div className="chartCard yearTimeline">
    <div className="chartCardHeader">
        <div>
            <span className="chartCardTitle">{title}</span>
            <span className="chartCardSubtitle">
                Performance across academic years
            </span>
        </div>
    </div>

    {years.length === 0 ? (
        <div className="metricsEmpty">
            No sessions found across years yet
        </div>
    ) : (
        <div className="timelineContent">

            <div className="timelineChart">

                {/* Y-axis */}
                <div className="timelineYAxis">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>

                {/* Actual chart area */}
                <div className="timelinePlot">

                    {/* Grid */}
                    <div className="timelineGridLines">
                        {[100, 75, 50, 25, 0].map((value) => (
                            <div
                                className="timelineGridLine"
                                key={value}
                            />
                        ))}
                    </div>

                    {/* Years */}
                    <div className="timelineYears">
                        {years.map((y) => {
                            const attendance = Math.min(
                                100,
                                Math.max(0, Number(y.attendance) || 0)
                            );

                            const performance = Math.min(
                                100,
                                Math.max(0, Number(y.performance) || 0)
                            );

                            const hours = Math.min(
                                100,
                                Math.max(
                                    0,
                                    ((Number(y.hours) || 0) / maxHours) * 100
                                )
                            );

                            const bars = [
                                {
                                    key: "attendance",
                                    value: attendance,
                                    display: `${Number(y.attendance) || 0}%`,
                                },
                                {
                                    key: "performance",
                                    value: performance,
                                    display: `${Number(y.performance) || 0}%`,
                                },
                                {
                                    key: "hours",
                                    value: hours,
                                    display: `${Number(y.hours) || 0}h`,
                                },
                            ];

                            return (
                                <div
                                    className="timelineYear"
                                    key={y.year}
                                >
                                    <div className="timelineBars">
                                        {bars.map((bar) => (
                                            <div
                                                className={`timelineBarWrap ${bar.key}`}
                                                key={bar.key}
                                            >
                                                <span className="timelineValue">
                                                    {bar.display}
                                                </span>

                                                <div className="timelineBar">
                                                    <div
                                                        className="timelineBarFill"
                                                        style={{
                                                            height: `${bar.value}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="timelineYearLabel">
                                        {y.year}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="timelineLegend">
                {series.map((s) => (
                    <div
                        className="timelineLegendItem"
                        key={s.key}
                    >
                        <span
                            className={`timelineLegendDot ${s.key}`}
                        />

                        <span>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )}
</div>
    );
}
/* current-year snapshot across all four metrics, grouped bars */
// export function ThisYearSummary({
//     year = new Date().getFullYear(),
//     attendance = 0,
//     performance = 0,
//     feedback = 0,
//     hours = 0,
//     maxHours,
// }) {
//     const hoursMax = maxHours || Math.max(1, hours);

//     const bars = [
//         { label: "Attendance", value: attendance, display: `${attendance}%`, color: "#f1af07" },
//         { label: "Performance", value: performance, display: `${performance}%`, color: "#4f8ef7" },
//         { label: "Feedback", value: feedback, display: `${feedback}%`, color: "#3fb950" },
//         {
//             label: "Hours",
//             value: (hours / hoursMax) * 100,
//             display: `${hours}`,
//             color: "#9b6bd6",
//         },
//     ];

//     return (
//         <div className="chartCard Year_Sum">
//             <div className="chartCardHeader">
//                 <span className="chartCardTitle">{year} summary</span>
//                 {/* <span className="chartCardMeta">assessments · feedback · attendance · hours</span> */}
//             </div>

//             <div className="barChart">
//                 {bars.map((b) => (
//                     <div className="barChartCol" key={b.label}>
//                         <span className="barChartValue">{b.display}</span>
//                         <div className="barChartTrack">
//                             <div
//                                 className="barChartFill"
//                                 style={{
//                                     height: `${Math.min(100, b.value)}%`,
//                                     background: b.color,
//                                 }}
//                             />
//                         </div>
//                         <span className="barChartLabel">{b.label}</span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

export function ThisYearSummary({
    year = new Date().getFullYear(),
    attendance = 0,
    performance = 0,
    feedback = 0,
    hours = 0,
    maxHours,
}) {
    const hoursMax = maxHours || Math.max(1, hours);

    const bars = [
        {
            label: "Attendance",
            value: attendance,
            display: `${attendance}%`,
            className: "attendance",
        },
        {
            label: "Performance",
            value: performance,
            display: `${performance}%`,
            className: "performance",
        },
        {
            label: "Feedback",
            value: feedback,
            display: `${feedback}%`,
            className: "feedback",
        },
        {
            label: "Hours",
            value: (hours / hoursMax) * 100,
            display: `${hours} hrs`,
            className: "hours",
        },
    ];

    return (
        <div className="chartCard Year_Sum">
            <div className="chartCardHeader">
                <div>
                    <span className="chartCardTitle">{year} summary</span>
                    <span className="chartCardMeta">
                        Performance overview
                    </span>
                </div>
            </div>

            <div className="yearSummaryChart">
                {bars.map((bar) => (
                    (bar.value)?(

                        <div className="yearSummaryItem" key={bar.label}>
                        <div className="yearSummaryTop">
                            <span className="yearSummaryLabel">
                                {bar.label}
                            </span>

                            <span className="yearSummaryValue">
                                {bar.display}
                            </span>
                        </div>

                        <div className="yearSummaryTrack">
                            <div
                                className={`yearSummaryFill ${bar.className}`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(0, bar.value)
                                    )}%`,
                                }}
                                />
                        </div>
                    </div>
                    ):("")
                ))}
            </div>
        </div>
    );
}


/* ============================================================
   Composite — renders the full "general" set for a scope.
   Every role dashboard imports this and hands it already-
   computed numbers (each role fetches/derives its own scope:
   student = own data, trainer = own sessions, moderator =
   their college, admin = org-wide).
   ============================================================ */

export default function GeneralMetrics({
    hoursDelivered,
    hoursTrend,
    performanceAvg,
    performanceTrend,
    attendanceSeries = [],      // [{ label, value }] recent periods, for the aggregate chart
    yearlyTimeline = [],        // [{ year, attendance, performance, hours }]
    thisYear,                   // { attendance, performance, feedback, hours }
}) {

  
    return (
        <div className="chartCardContainer">
            {/* <div className="metricsGrid"> */}
                {/* <KPICard
                    label="Hours delivered"
                    value={hoursDelivered ?? "—"}
                    unit="hrs"
                    sub={hoursTrend}
                    subTrend={hoursTrend?.startsWith("-") ? "down" : hoursTrend ? "up" : undefined}
                /> */}
                {/* <KPICard
                    label="Performance rating"
                    value={performanceAvg ?? "—"}
                    unit="%"
                    sub={performanceTrend}
                    subTrend={performanceTrend?.startsWith("-") ? "down" : performanceTrend ? "up" : undefined}
                /> */}
            {/* </div> */}


            {thisYear && (
                <ThisYearSummary
                attendance={thisYear.attendance}
                performance={thisYear.performance}
                feedback={thisYear.feedback}
                hours={thisYear.hours}
                />
            )}
            {/* <BarChart
                title="Attendance"
                meta="aggregate"
                data={attendanceSeries}
            /> */}
        </div>
    );
}