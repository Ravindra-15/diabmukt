/**
 * Customer — Select Tenure Page
 * Fetches plans dynamically from backend for the current program.
 * Works for any program (yogat20, diabmukt, mommyfit, slimfitter).
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicProgramPlans } from "../../../services/programPlanPublicService";

const programNames = {
  yogat20: "Yoga T20",
  diabmukt: "Diabmukt",
  mommyfit: "MommyFit",
  slimfitter: "Slimfitter",
};

const formatPrice = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;

export default function SelectTenure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const programName = programNames[id] || id;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🙋 Show user's first name in heading
  let firstName = "";
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    firstName = user?.nickName || user?.fullName?.split(" ")[0] || "";
  } catch {
    firstName = "";
  }

  // 📥 Fetch plans for this program
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ALL active plans (not just landingOnly) so tenure page shows full list
        const fetched = await getPublicProgramPlans(id);
        if (!mounted) return;
        setPlans(fetched || []);
      } catch (err) {
        console.error("Failed to load tenure plans:", err);
        if (mounted) setError("Failed to load plans. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSelect = (plan) => {
    navigate(`/programs/${id}/checkout`, {
      state: {
        tenure: plan.planName,
        price: plan.offerPrice,
        originalPrice: plan.originalPrice,
        offerBadge: plan.offerBadge,
        programId: id,
        programName,
        planId: plan._id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900/80 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl px-6 sm:px-10 py-10">
        {/* heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
            Select your Tenure
          </h2>
          <p className="text-sm text-[#6B7280]">
            {firstName ? (
              <>
                Hey{" "}
                <span className="text-[#4F46E5] font-semibold">
                  {firstName}
                </span>
                ,{" "}
              </>
            ) : null}
            Select your Program Duration
          </p>
        </div>

        {/* states */}
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">
            Loading plans...
          </p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-10">{error}</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">
            No plans available for this program yet.
          </p>
        ) : (
          <div
            className={`grid gap-4 ${
              plans.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : plans.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {plans.map((plan) => {
              const hasDiscount =
                plan.originalPrice &&
                plan.originalPrice > plan.offerPrice;

              return (
                <div
                  key={plan._id}
                  onClick={() => handleSelect(plan)}
                  className="border border-[#D9DDF0] rounded-2xl p-5 hover:border-[#4F46E5] hover:shadow-[0_8px_22px_rgba(79,70,229,0.18)] transition-all cursor-pointer flex flex-col"
                >
                  {/* top row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#0F172A] text-base">
                      {plan.planName}
                    </span>
                    {plan.offerBadge && (
                      <span className="bg-[#4F46E5] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {plan.offerBadge}
                      </span>
                    )}
                  </div>

                  {/* original price */}
                  <p
                    className={`text-xs text-gray-400 line-through mb-1 ${
                      hasDiscount ? "" : "invisible"
                    }`}
                  >
                    {formatPrice(plan.originalPrice)}
                  </p>

                  {/* price */}
                  <p className="text-2xl font-bold text-[#0F172A] mb-4">
                    {formatPrice(plan.offerPrice)}
                  </p>

                  {/* select button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(plan);
                    }}
                    className="mt-auto w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.32)]"
                  >
                    Select Plan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}