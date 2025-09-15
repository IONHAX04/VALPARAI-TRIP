"use server";
import { generateDashboardCharts, type GenerateDashboardChartsInput, type GenerateDashboardChartsOutput } from "@/ai/flows/generate-dashboard-charts";

export async function getAiCharts(input: GenerateDashboardChartsInput): Promise<GenerateDashboardChartsOutput> {
  try {
    // In a real app, additional authentication and authorization checks
    // would be performed here to ensure the user has permission to perform this action.
    const result = await generateDashboardCharts(input);
    return result;
  } catch (error) {
    console.error("Error generating AI charts:", error);
    // Re-throw or return a structured error object
    throw new Error("Failed to generate AI-powered chart suggestions.");
  }
}
