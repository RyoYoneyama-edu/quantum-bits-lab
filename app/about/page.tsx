import Link from "next/link";
import PublicHeader from "@/components/home/PublicHeader";

const HIGHLIGHTS = [
  {
    title: "Lifestyle Energy",
    body: "日常の暖房・冷房・家電など、身近な「電力の使われ方」を物理の視点からわかりやすく解説します。"
  },
  {
    title: "Home & Insulation",
    body: "賃貸でも実践できる断熱・空調・日射対策を、熱の流れや建築物理に基づいて丁寧に説明します。"
  },
  {
    title: "Digital & AI Energy",
    body: "スマホ・PCからデータセンター・生成AIまで、デジタル技術がどれくらい電力を使い、なぜそうなるのかを科学的に読み解きます。"
  },
  {
    title: "Future Energy Computing",
    body: "最新デバイス技術がどのようにエネルギー効率を変えるのかを深掘りします。"
  },
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-white to-slate-100">
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              About
            </p>
            <h1 className="text-3xl font-bold text-slate-900">EnerTech Labについて</h1>
            <p className="text-base text-slate-600">
              EnerTech Lab は、暮らしのエネルギーからデジタル機器・AI・データセンター、そして次世代デバイス技術まで、
              電力・効率・物理という共通軸で読み解く技術メディアです。
              「複雑だけど大事なテクノロジー」を身近な例とつなげながら、
              生活者から理系学生・エンジニアまで幅広い読者に“理解できる言葉”で届けることを目指しています。
            </p>
          </header>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Mission</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                エアコンや家電、スマホ、データセンター、AIモデル、そしてスピントロニクスのような次世代デバイスまで、
                あらゆるテクノロジーの裏側にある”エネルギー効率”のしくみを、専門用語だけに頼らず、
                物理と情報科学が交差するストーリーとしてわかりやすく翻訳します。

                「なんとなく使っているテクノロジー」を、「なぜそう動くのか？」と自然に考えられる人を増やす。
                それが EnerTech Lab の使命です。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Vision</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                生活の電気代からAIの電力問題、未来の省エネコンピューティングまで、
                “エネルギーで世界を見る”という視点を広げることで、
                テクノロジーをより深く理解し、主体的に選べる人を増やしたい。

                大学生もエンジニアも、家電選びに悩む人も、
                この記事を通してそれぞれの問いを持ち帰れるような――
                そんな「小さな研究室」のようなメディアであり続けます。
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Coverage</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">お問い合わせ</h2>
            <p className="text-sm text-slate-600">
              記事内容へのご意見や、取り上げてほしいテーマのリクエストなどのご相談は、以下のメールアドレスまでご連絡ください。
            </p>
            <Link
              href="mailto:taruku23@gmail.com"
              className="inline-flex items-center rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d625b]"
            >
              taruku23@gmail.com
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}

