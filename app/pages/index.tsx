import Page from '../components/Page'
import Section from '../components/Section'
import UploadFile from '../components/UploadFile'
import Uploads from '../components/Uploads'

const IndexPage = () => (
  <Page title="Data Profiler" >
    <Section className="inline">
      <UploadFile />
    </Section>
    <Section heading="List of uploads">
      <Uploads />
    </Section>
  </Page>
)

export default IndexPage
