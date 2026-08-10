const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5053/api";

async function getServicePlans() {
  try {
    const response = await fetch(`${apiBaseUrl}/service-plans?currency=VND`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const servicePlans = await getServicePlans();
  const plans = Array.isArray(servicePlans) ? servicePlans : [];

  return (
    <main className="container">
      <section className="hero">
        <p className="badge">Next.js Frontend</p>
        <h1>Cloud Service Store</h1>
        <p className="subtitle">
          Frontend cơ bản để test push/pull GitHub và kết nối thử với backend .NET Web API.
        </p>
      </section>

      <section className="card">
        <h2>Kết nối backend</h2>
        <p>
          API đang trỏ tới: <code>{apiBaseUrl}</code>
        </p>
        <p>
          Service plans lấy được: <strong>{plans.length}</strong>
        </p>
      </section>

      <section className="grid">
        {plans.length > 0 ? (
          plans.slice(0, 6).map((plan: Record<string, unknown>, index: number) => (
            <article className="card" key={String(plan.id ?? index)}>
              <h3>{String(plan.name ?? plan.title ?? "Gói dịch vụ")}</h3>
              <p>{String(plan.description ?? "Dữ liệu từ backend/database.")}</p>
            </article>
          ))
        ) : (
          <article className="card">
            <h3>Chưa có dữ liệu</h3>
            <p>Chạy backend ở port 5053 để frontend đọc dữ liệu từ database.</p>
          </article>
        )}
      </section>
    </main>
  );
}
