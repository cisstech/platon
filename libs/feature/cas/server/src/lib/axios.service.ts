import { Injectable } from '@nestjs/common'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios-https-proxy-fix'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AxiosService {
  private proxyHost: string
  private proxyPort: number

  constructor(private configService: ConfigService) {
    this.proxyHost = this.configService.get<string>('PROXY_CONFIG_HOST') || ''
    this.proxyPort = this.configService.get<number>('PROXY_CONFIG_PORT') || 0
  }

  async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    if (this.proxyHost && this.proxyPort) {
      // if proxy is configured
      config.proxy = {
        host: this.proxyHost,
        port: this.proxyPort,
      }
    }
    const response = await axios.get(url, config)
    return response
  }
}
