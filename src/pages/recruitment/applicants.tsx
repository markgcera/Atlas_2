import { Text } from '@chakra-ui/react'
import Head from 'next/head'
import Layout from '~/components/common/Layout'
import TopNavbar from '~/components/common/TopNavbar'
import SearchBar from '~/components/common/SearchBar'
import withAuth, { type BaseProps } from '~/utils/withAuth'
import ApplicantGrid from '~/components/recruitment/ApplicantGrid'
import InfoPopup from '~/components/recruitment/InfoPopup'
import { trpc } from '~/utils/trpc'
import { useSelector } from 'react-redux'
import { selectSearchValue } from '~/components/recruitment/searchNameSlice'

const ApplicantsPage: React.FC<BaseProps> = ({ session }) => {
  const { data } = trpc.recruitment.getAllApplicants.useQuery()
  const searchValue = useSelector(selectSearchValue)

  const filteredData = data?.filter((item) =>
    searchValue == '' ? item : item.name?.toLowerCase().includes(searchValue)
  )

  return (
    <>
      <Head>
        <title>Atlas | Applicants </title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="The applicants page for Atlas recruitment"
        />
      </Head>
      <TopNavbar isAdmin={session.isAdmin} />
      <Layout>
        <Text className="text-center text-4xl font-bold">Applicants</Text>
        <SearchBar />
        <ApplicantGrid data={filteredData} />
        <InfoPopup />
      </Layout>
    </>
  )
}

export default withAuth(ApplicantsPage, true)
