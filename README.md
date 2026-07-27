# Pure Research Peptide Lab

Standalone first-pass brand and website build for `pureresearchpeptidelab.com`.

## Render Deployment

This site is prepared for Render Static Site hosting with `render.yaml`.

Render service settings:

- Service type: Static Site
- Build command: leave blank
- Publish directory: `.`
- Custom domain: `pureresearchpeptidelab.com`

After the Render static site is created, move DNS away from Netlify:

- Root/apex `pureresearchpeptidelab.com`: replace the current Netlify apex record with Render's required apex record.
- `www.pureresearchpeptidelab.com`: replace the current Netlify CNAME with the Render-provided CNAME target.

Verify the cutover with:

```sh
curl -I -L --max-time 20 https://pureresearchpeptidelab.com/
curl -I -L --max-time 20 https://www.pureresearchpeptidelab.com/
```

## Compliance Posture

This build intentionally avoids:

- Human-use claims
- Dosing, cycle, injection, or administration guidance
- Treatment, diagnosis, cure, prevention, performance, wellness, anti-aging, weight-loss, bodybuilding, recovery, or cosmetic claims
- Product efficacy language

It includes:

- 21+ age gate
- Research-use-only language
- Not-for-human-use notices
- Controlled inquiry language
- COA/documentation framing without safety/efficacy promises

This is not legal advice. Have final wording reviewed by qualified counsel before commerce use.
