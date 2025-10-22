import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
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

    // Create ZIP
    const zip = new JSZip();

    // Generate guide markdown
    let guideMarkdown = vendorSpec.introTemplate(ctx);

    for (const optionKey of selectedOptions) {
      const option = getVendorOption(vendorSpec, optionKey);
      if (option) {
        guideMarkdown += "\n\n" + option.guideTemplate(ctx);
      }
    }

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

---
`;

    // Add guide to ZIP
    zip.file("INTEGRATION-GUIDE.md", guideMarkdown);

    // Add artifacts to ZIP
    for (const optionKey of selectedOptions) {
      const option = getVendorOption(vendorSpec, optionKey);
      if (option) {
        for (const artifact of option.artifacts) {
          if (artifact.type === "file") {
            zip.file(artifact.path, artifact.contents(ctx));
          } else if (artifact.type === "command") {
            // Add commands to a scripts file
            const scriptContent = `#!/bin/bash\n# ${artifact.label}\n${artifact.cmd(ctx)}\n`;
            zip.file(`scripts/${artifact.label.replace(/\s+/g, "-").toLowerCase()}.sh`, scriptContent);
          }
        }
      }
    }

    // Add README
    const readme = `# ${clientName} Edge Integration

Environment: ${env.toUpperCase()}
Vendor: ${vendorSpec.name}

## Contents

- **INTEGRATION-GUIDE.md**: Complete step-by-step integration guide
- **Configuration files**: Ready-to-use configuration files
- **scripts/**: Deployment and management scripts

## Getting Started

1. Read INTEGRATION-GUIDE.md for detailed instructions
2. Review and customize configuration files as needed
3. Run deployment scripts from the scripts/ directory

## Prerequisites

${vendorSpec.prerequisites.map((p) => `- ${p}`).join("\n")}

## Support

Refer to INTEGRATION-GUIDE.md for troubleshooting and support information.
`;

    zip.file("README.md", readme);

    // Generate ZIP buffer
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Return ZIP file
    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${clientName}-edge-integration.zip"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export files" },
      { status: 500 }
    );
  }
}

