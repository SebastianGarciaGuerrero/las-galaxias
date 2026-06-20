import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'CD Las Galaxias'
const DEFAULT_DESC = 'CD Las Galaxias de Valparaíso. Pasión, disciplina y familia desde 2017. Conoce nuestras ligas de fútbol, academia formativa, noticias y estadísticas en vivo.'
const DEFAULT_IMAGE = 'https://www.lasgalaxias.cl/thumbnail.png'
const SITE_URL = 'https://www.lasgalaxias.cl'

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Fútbol y Conciencia`
  const pageDesc = description || DEFAULT_DESC
  const pageImage = image || DEFAULT_IMAGE
  const pageUrl = url || SITE_URL

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  )
}

export default SEO
