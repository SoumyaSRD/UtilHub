import { featureRegistry } from './featureRegistry';

// Import all feature definitions
import { dashboardFeature } from '@features/dashboard';
import { tabularViewerFeature } from '@features/excel-tools/tabular-viewer';
import { columnExtractorFeature } from '@features/excel-tools/column-extractor';
import { duplicateRemoverFeature } from '@features/excel-tools/duplicate-remover';
import { excelCompareFeature } from '@features/excel-tools/excel-compare';
import { csvToJsonFeature } from '@features/excel-tools/csv-to-json';
import { inClauseFeature } from '@features/sql-tools/in-clause';
import { insertGeneratorFeature } from '@features/sql-tools/insert';
import { updateGeneratorFeature } from '@features/sql-tools/update';
import { jsonFormatterFeature } from '@features/text-tools/json-formatter';
import { regexTesterFeature } from '@features/text-tools/regex';
import { base64Feature } from '@features/text-tools/base64';
import { documentStudioFeature } from '@features/document-studio';
import { universalDiffFeature } from '@features/universal-diff';
import { codeFormatterFeature } from '@features/code-formatter';
import { tierMappingFeature } from '@features/pricing-tools/tier-mapping';
import { catalogueCheckFeature } from '@features/pricing-tools/catalogue-check';
import { pricingValidatorFeature } from '@features/pricing-tools/validator';
import { jwtDecoderFeature } from '@features/api-tools/jwt-decoder';
import { curlGeneratorFeature } from '@features/api-tools/curl-generator';
import { swaggerViewerFeature } from '@features/api-tools/swagger';
import { adminFeature } from '@features/admin-tools';

export const registerAllFeatures = (): void => {
  featureRegistry.registerAll([
    dashboardFeature,
    // Document & File Studio
    documentStudioFeature,
    // Excel & CSV Tools
    tabularViewerFeature,
    columnExtractorFeature,
    duplicateRemoverFeature,
    excelCompareFeature,
    csvToJsonFeature,
    // SQL Tools
    inClauseFeature,
    insertGeneratorFeature,
    updateGeneratorFeature,
    // Text & Diff Tools
    codeFormatterFeature,
    universalDiffFeature,
    jsonFormatterFeature,
    regexTesterFeature,
    base64Feature,
    // Pricing Tools
    tierMappingFeature,
    catalogueCheckFeature,
    pricingValidatorFeature,
    // API Tools
    jwtDecoderFeature,
    curlGeneratorFeature,
    swaggerViewerFeature,
    // Admin Governance
    adminFeature,
  ]);
};
