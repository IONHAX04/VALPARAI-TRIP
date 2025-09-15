'use server';

/**
 * @fileOverview Generates charts for the dashboard based on the trip's budget and expenses.
 *
 * - generateDashboardCharts - A function that generates chart configurations based on the budget and expense data.
 * - GenerateDashboardChartsInput - The input type for the generateDashboardCharts function.
 * - GenerateDashboardChartsOutput - The return type for the generateDashboardCharts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDashboardChartsInputSchema = z.object({
  overallBudget: z.number().describe('The overall budget for the trip.'),
  expenses: z.array(
    z.object({
      member: z.string().describe('The name of the member who contributed.'),
      amount: z.number().describe('The amount contributed by the member.'),
      purpose: z.string().describe('The purpose of the contribution.'),
      timestamp: z.string().describe('The timestamp of the contribution.'),
    })
  ).describe('An array of expense objects.'),
});
export type GenerateDashboardChartsInput = z.infer<typeof GenerateDashboardChartsInputSchema>;

const GenerateDashboardChartsOutputSchema = z.object({
  chartConfigurations: z.array(
    z.object({
      type: z.string().describe('The type of chart to generate (e.g., pie, bar).'),
      data: z.any().describe('The data to be used in the chart.'),
      options: z.any().describe('Configuration options for the chart.'),
      description: z.string().describe('A description of what the chart visualizes.')
    })
  ).describe('An array of chart configuration objects.'),
});
export type GenerateDashboardChartsOutput = z.infer<typeof GenerateDashboardChartsOutputSchema>;

export async function generateDashboardCharts(input: GenerateDashboardChartsInput): Promise<GenerateDashboardChartsOutput> {
  return generateDashboardChartsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardChartsPrompt',
  input: {schema: GenerateDashboardChartsInputSchema},
  output: {schema: GenerateDashboardChartsOutputSchema},
  prompt: `You are an expert data visualization specialist. Given the overall budget for a trip and a list of expenses, your task is to suggest chart configurations that would be most helpful in visualizing the financial status of the trip.

Overall Budget: {{{overallBudget}}}

Expenses:
{{#each expenses}}
  - Member: {{{member}}}, Amount: {{{amount}}}, Purpose: {{{purpose}}}, Timestamp: {{{timestamp}}}
{{/each}}

Consider these chart types:
- Pie chart: To show the distribution of expenses among members or categories.
- Bar chart: To compare the amounts contributed by different members or to track expenses over time.
- Line chart: To visualize the remaining budget over time.

Return an array of chart configuration objects. Each object should include the chart type, the data to be used in the chart, configuration options, and a description of what the chart visualizes. The data should be in a format suitable for recharts or primereact chart components. Be as specific as possible with data and options so that the chart can be rendered directly from your configurations.
`,
});

const generateDashboardChartsFlow = ai.defineFlow(
  {
    name: 'generateDashboardChartsFlow',
    inputSchema: GenerateDashboardChartsInputSchema,
    outputSchema: GenerateDashboardChartsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
