"use client";

import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

type VisualPet = {
  name: string;
  image?: string;
};

type FruitNeed = {
  name: string;
  image?: string;
};

const plans: {
  title: string;
  subtitle: string;
  accent: string;
  badgeClass: string;
  note: string;
  fruits: FruitNeed[];
  targets: VisualPet[];
}[] = [
  {
    title: "幻系方案",
    subtitle: "3×3 混抓方案",
    accent: "from-violet-100 via-fuchsia-50 to-white",
    badgeClass: "bg-violet-100 text-violet-800",
    note: "配方：仪使者果实 + 哭哭菇果实。概率出异色：粉粉星、粉星仔、月牙雪熊。",
    fruits: [{ name: "仪使者果实" }, { name: "哭哭菇果实" }],
    targets: [
      { name: "粉粉星", image: "/pets/yise-fenfenxing.png" },
      { name: "粉星仔", image: "/pets/yise-fenxingzi.png" },
      { name: "月牙雪熊", image: "/pets/yise-yueyaxuexiong.png" },
    ],
  },
  {
    title: "电系方案",
    subtitle: "3×3 混抓方案",
    accent: "from-cyan-100 via-sky-50 to-white",
    badgeClass: "bg-cyan-100 text-cyan-800",
    note: "配方：拉特果实 + 电咩咩果实。概率出异色：粉粉星、拉特、双灯鱼。",
    fruits: [{ name: "拉特果实" }, { name: "电咩咩果实" }],
    targets: [
      { name: "粉粉星", image: "/pets/yise-fenfenxing.png" },
      { name: "异色酷拉", image: "/pets/yise-kula.png" },
      { name: "双灯鱼", image: "/pets/yise-shuangdengyu.png" },
    ],
  },
  {
    title: "火系方案",
    subtitle: "3×3 混抓方案",
    accent: "from-orange-100 via-rose-50 to-white",
    badgeClass: "bg-orange-100 text-orange-800",
    note: "配方：治愈兔果实 + 火红马果实。概率出异色：治愈兔、火红马、燃薪虫、贝瑟。",
    fruits: [{ name: "治愈兔果实" }, { name: "火红马果实" }],
    targets: [
      { name: "治愈兔", image: "/pets/yise-zhiyutu.png" },
      { name: "火红马" },
      { name: "燃薪虫", image: "/pets/yise-ranxinchong.png" },
      { name: "贝瑟", image: "/pets/yise-beise.png" },
    ],
  },
  {
    title: "幽系方案",
    subtitle: "3×3 混抓方案",
    accent: "from-slate-100 via-zinc-50 to-white",
    badgeClass: "bg-slate-100 text-slate-800",
    note: "配方：幽影树果实 + 小灵菇果实。概率出异色：空空颅。",
    fruits: [{ name: "幽影树果实" }, { name: "小灵菇果实" }],
    targets: [{ name: "空空颅", image: "/pets/yise-kongkonglu.png" }],
  },
  {
    title: "光系方案",
    subtitle: "3×3 混抓方案",
    accent: "from-amber-100 via-yellow-50 to-white",
    badgeClass: "bg-amber-100 text-amber-800",
    note: "配方：疾光兽果实 + 绒仙子果实。概率出异色：疾光兽、绒仙子、嗜光嗡嗡。",
    fruits: [{ name: "疾光兽果实" }, { name: "绒仙子果实" }],
    targets: [
      { name: "疾光兽" },
      { name: "绒仙子" },
      { name: "嗜光嗡嗡", image: "/pets/yise-shiguangwengweng.png" },
    ],
  },
];

function PlaceholderTile({ name, image }: { name: string; image?: string }) {
  return (
    <div className="rounded-[20px] bg-muted/45 p-2 text-center">
      {image ? (
        <PetImage
          src={image}
          alt={name}
          className="mx-auto aspect-square w-full max-w-[66px] rounded-[18px]"
        />
      ) : (
        <div className="mx-auto flex aspect-square w-full max-w-[66px] items-center justify-center rounded-[18px] border border-dashed border-border/80 bg-white text-[11px] font-bold text-muted-foreground">
          {name.slice(0, 2)}
        </div>
      )}
      <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4">{name}</p>
    </div>
  );
}

export default function PetsPage() {
  return (
    <PageShell title="精灵抓取方案">
      <section className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.title} className="overflow-hidden">
            <div className={`bg-gradient-to-br ${plan.accent} px-5 py-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{plan.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>
                <Badge className={plan.badgeClass}>定向刷取</Badge>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  目标精灵
                </p>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {plan.targets.map((target) => (
                    <PlaceholderTile key={target.name} name={target.name} image={target.image} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  所需果实
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {plan.fruits.map((fruit) => (
                    <PlaceholderTile key={fruit.name} name={fruit.name} image={fruit.image} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
