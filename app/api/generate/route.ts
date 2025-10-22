import { NextRequest, NextResponse } from "next/server";
import { getVendor, getVendorOption, TemplateContext } from "@/lib/vendors";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, env, vendor, selectedOptions, inputs } = body;

    if (!clientName || !env || !vendor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vendorSpec = getVendor(vendor);
    if (!vendorSpec) {
      return NextResponse.json(
        { error: "Invalid vendor" },
        { status: 400 }
      );
    }

    const ctx: TemplateContext = {
      clientName,
      env,
      vendor,
      inputs,
    };

    // Generate guide markdown
    let guideMarkdown = vendorSpec.introTemplate(ctx);

    // Add sections for each selected option
    for (const optionKey of selectedOptions) {
      const option = getVendorOption(vendorSpec, optionKey);
      if (option) {
        guideMarkdown += "\n\n" + option.guideTemplate(ctx);
      }
    }

    // Add verification section
    guideMarkdown += `

---

## Verification

After completing the integration, verify that everything is working correctly:

1. **DNS Propagation**: Use \`dig\` or online tools to verify DNS changes have propagated
2. **HTTPS Access**: Test accessing your domain via HTTPS
3. **Worker/Function Execution**: Check logs to ensure your edge functions are executing
4. **End-to-End Test**: Perform a full request flow from client to origin

## Rollback Procedure

If you encounter issues:

1. **DNS**: Revert DNS changes to point back to original infrastructure
2. **Worker/Function**: Disable or remove the edge function deployment
3. **Cache**: Clear CDN cache if needed
4. **Rules**: Disable any page rules or behaviors that were added

## Support

For vendor-specific issues, refer to:

- **Cloudflare**: https://developers.cloudflare.com/workers/
- **Akamai**: https://techdocs.akamai.com/edgeworkers/
- **AWS CloudFront**: https://docs.aws.amazon.com/cloudfront/
- **Fastly**: https://docs.fastly.com/products/compute-at-edge

For integration-specific questions, review this guide and verify all configuration values are correct.

---
`;

    // Collect artifacts
    const artifacts: any[] = [];

    for (const optionKey of selectedOptions) {
      const option = getVendorOption(vendorSpec, optionKey);
      if (option) {
        for (const artifact of option.artifacts) {
          if (artifact.type === "file") {
            artifacts.push({
              type: "file",
              path: artifact.path,
              contents: artifact.contents(ctx),
            });
          } else if (artifact.type === "command") {
            artifacts.push({
              type: "command",
              label: artifact.label,
              cmd: artifact.cmd(ctx),
            });
          }
        }
      }
    }

    return NextResponse.json({
      guideMarkdown,
      artifacts,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate guide" },
      { status: 500 }
    );
  }
}

