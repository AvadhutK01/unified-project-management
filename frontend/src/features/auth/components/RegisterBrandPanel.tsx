import { BarChart3, Layers, Users, Zap } from "lucide-react";

const features = [
    { Icon: Users, text: "Invite your team in seconds" },
    { Icon: Zap, text: "Automate repetitive workflows" },
    { Icon: BarChart3, text: "Track progress with live dashboards" },
];

export const RegisterBrandPanel = () => (
    <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
            background:
                "linear-gradient(145deg, #da7756 0%, #c4624a 55%, #a84f3a 100%)",
        }}
    >
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute top-8 left-8 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full border border-white/10" />
            <div className="absolute bottom-8 right-8 w-80 h-80 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
                Unified
            </span>
        </div>

        <div className="relative z-10 space-y-10">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-white text-xs font-medium">
                        Free tier available forever — no credit card needed
                    </span>
                </div>
                <h1 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
                    Start shipping
                    <br />
                    faster today
                </h1>
                <p className="text-white/75 text-base leading-relaxed max-w-xs">
                    Join thousands of teams who use Unified to plan, track, and
                    deliver their best work.
                </p>
            </div>

            <div className="space-y-3">
                {features.map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-3.5">
                        <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/85 text-sm font-medium">
                            {text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
