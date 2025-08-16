import Page from '../components/Page'
import Section from '../components/Section'
import UploadFile from '../components/UploadFile'
import Uploads from '../components/Uploads'
import isPropValid from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';

// This implements the default behavior from styled-components v5
function shouldForwardProp(propName, target) {
    if (typeof target === "string") {
        // For HTML elements, forward the prop if it is a valid HTML attribute
        return isPropValid(propName);
    }
    // For other elements, forward all props
    return true;
}

const IndexPage = () => (
    <Page title="Data Profiler" >
      <Section className="inline">
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
          <UploadFile />
        </StyleSheetManager>
      </Section>
      <Section heading="List of uploads">
        <Uploads />
      </Section>
    </Page>

)

export default IndexPage
