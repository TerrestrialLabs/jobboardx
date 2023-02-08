import axios from "axios";
import { GetServerSideProps } from "next";
import { Employer } from "../models/User";

const generateSiteMap = ({ baseUrl, companies }: { baseUrl: string, companies: Employer[] }) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
              <loc>${baseUrl}</loc>
              <priority>1.00</priority>
          </url> 
          <url>
              <loc>${baseUrl}companies</loc>
              <priority>0.80</priority>
          </url>
          <url>
              <loc>${baseUrl}employers/login</loc>
              <priority>0.80</priority>
          </url>
          <url>
              <loc>${baseUrl}employers/signup</loc>
              <priority>0.80</priority>
          </url>
          <url>
              <loc>${baseUrl}terms</loc>
              <priority>0.80</priority>
          </url>
          <url>
              <loc>${baseUrl}privacy</loc>
              <priority>0.80</priority>
          </url>
          <url>
              <loc>${baseUrl}contact</loc>
              <priority>0.80</priority>
          </url>
            ${companies
              .map(employer => {
                return `
                  <url>
                      <loc>${`${baseUrl}?search=${encodeURIComponent(employer.employer.company)}`}</loc>
                      <priority>0.64</priority>
                  </url>
                `;
              })
              .join('')}
        </urlset>
    `;
}

const Sitemap: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const local = req.headers.host?.includes('localhost')
  const baseUrl = local ? process.env.NEXT_PUBLIC_BASE_URL_LOCAL : `https://${req.headers.host}/`
  const baseUrlApi = `${baseUrl}api/`

  const jobboardRes = await axios.get(`${baseUrlApi}jobboards/current`)
  const response = await axios.get(`${baseUrlApi}companies?jobboardId=${jobboardRes.data._id}`)

  const sitemap = generateSiteMap({ baseUrl: baseUrl as string, companies: response.data })

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default Sitemap