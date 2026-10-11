# WattWise — AI Energy Coach

WattWise is a browser-first hackathon MVP for the **Waste and Energy** track. It helps an Indian household understand aggregate electricity readings, see an estimated appliance mix, and explore practical ways to reduce energy use.

## Run the demo

Open `index.html` in a browser, or serve this folder with any static web server. No build step or account is required. Click **Analyze my home** to restore the sample household. Upload a CSV with a timestamp column and power column, for example:

```csv
timestamp,power_w
2026-09-01T00:00:00,410
2026-09-01T00:15:00,520
2026-09-01T00:30:00,475
```

Power values are treated as watts when above 20 and kilowatts otherwise. WattWise estimates a 30-day month from the file's average load. Uploads stay in the browser; this prototype does not send readings to a server.

## What works

- Sample household dashboard, responsive for desktop and mobile
- CSV parsing and monthly energy extrapolation
- Estimated appliance breakdown, bill, carbon footprint, and ranked savings actions
- Local coach responses in English, Hindi, and Tamil; optional live Strands/Bedrock coach
- AWS SAM template and Python Lambda endpoints for deterministic analysis and tool-grounded chat

The demo's appliance mix is an illustrative heuristic. Aggregate meter data cannot uniquely identify appliances; the displayed labels and shares need household correction and validation. Without an API URL configured, the coach uses local response templates; with a deployed API URL it uses Strands Agents and Bedrock, with deterministic calculation results returned by a tool. Bedrock model access and billing configuration are required. Bill calculations use a clearly illustrative blended rate of ₹5.65/kWh and omit state slabs, fixed charges, taxes, and subsidies. The CO₂ display uses a rounded demo factor of 0.70 kg/kWh; for a submission that claims measured impact, replace it with the selected factor from the relevant edition of the [CEA CO₂ Baseline Database](https://cea.nic.in/cdm-co2-baseline-database/?lang=en). Do not report model estimates as verified household savings.

## AWS path

`template.yaml` uses AWS SAM (an AWS open-source tool) to define an API Gateway HTTP API and a Python Lambda with `/analyze` and `/chat` endpoints. Install AWS SAM CLI, configure AWS credentials, and enable a Bedrock model in your AWS account to build/deploy:

```powershell
sam build
sam deploy --guided
```

After deployment, copy the `ApiBaseUrl` output into `WATTWISE_API_URL` near the top of `app.js`. The browser will use `/chat` for the live coach. The Lambda's `/analyze` endpoint accepts `{"kwh_month": 386}` and returns deterministic estimates. The frontend CSV upload remains local to the browser in this MVP. Host the static files on S3/CloudFront or Amplify for a public demo. Keep the invariant: **code calculates; the model explains tool results.**

## Hackathon submission checklist

- Track: Waste and Energy
- Show the end-to-end flow in the three-minute video: upload/demo data → estimates → savings action → ask the coach
- Explain uncertainty and the illustrative tariff/emissions assumptions
- Include your AWS SAM/API usage or deployed AWS URL in the submission
- Record real user feedback and avoid claiming actual bill reductions until measured
