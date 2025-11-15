from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import isodate


class YouTubeService:
    def __init__(self, api_key: str):
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    async def search_travel_videos(self, destination: str, categorytags: list[str], max_results: int = 10):
        """
        搜索旅行相关视频 - 保持原有逻辑，添加按播放量排序
        """
        try:
            tags = ""
            for tag in categorytags:
                tags += f" {tag}"
            # 搜索查询 - 保持原有逻辑
            search_query = f"{destination} travel guide {tags}"
            # 执行搜索 - 保持原有逻辑
            print("开始搜索")
            search_response = self.youtube.search().list(
                q=search_query,
                part='id,snippet',
                type='video',
                maxResults=max_results * 2,  # 获取更多结果用于排序
                relevanceLanguage='en',
                order='relevance'
            ).execute()
            print(search_response)
            videos = []
            for item in search_response.get('items', []):
                if item['id']['kind'] == 'youtube#video':
                    video_id = item['id']['videoId']

                    # 获取视频详情（包括时长）
                    video_response = self.youtube.videos().list(
                        part='contentDetails,statistics',
                        id=video_id
                    ).execute()

                    if video_response['items']:
                        video_details = video_response['items'][0]

                        # 解析时长
                        duration = video_details['contentDetails']['duration']
                        duration_str = self.parse_duration(duration)

                        # 获取统计数据
                        stats = video_details.get('statistics', {})
                        like_count = stats.get('likeCount', '0')
                        view_count = stats.get('viewCount', '0')

                        # 格式化点赞数
                        likes = self.format_count(like_count)

                        video_data = {
                            'video_id': video_id,
                            'title': item['snippet']['title'],
                            'description': item['snippet']['description'],
                            'thumbnail': item['snippet']['thumbnails']['high']['url'],
                            'channel_title': item['snippet']['channelTitle'],
                            'duration': duration_str,
                            'likes': likes,
                            'views': view_count,
                            'view_count': int(view_count) if view_count.isdigit() else 0,  # 添加用于排序的字段
                            'published_at': item['snippet']['publishedAt']
                        }
                        videos.append(video_data)

            # 新增：按播放量排序，取前 max_results 个
            videos_sorted = sorted(videos, key=lambda x: x['view_count'], reverse=True)[:max_results]
            return videos_sorted

        except HttpError as e:
            print(f"YouTube API error: {e}")
            return []
        except Exception as e:
            print(f"YouTube search error: {e}")
            return []

    def parse_duration(self, duration):
        """解析 ISO 8601 时长格式"""
        try:
            duration_obj = isodate.parse_duration(duration)
            total_seconds = int(duration_obj.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return f"{minutes}:{seconds:02d}"
        except:
            return "0:00"

    def format_count(self, count):
        """格式化数字显示"""
        try:
            num = int(count)
            if num >= 1000000:
                return f"{num / 1000000:.1f}M"
            elif num >= 1000:
                return f"{num / 1000:.1f}K"
            else:
                return str(num)
        except:
            return "0"


class GoogleSearchService:
    def __init__(self, api_key: str, search_engine_id: str):
        self.api_key = api_key
        self.search_engine_id = search_engine_id

    async def search_travel_content(self, destination: str, categorytags: list[str], max_results: int = 10):
        """
        使用 Google Custom Search API 搜索旅行内容 - TikTok 只搜索包含 /video/ 的链接
        """
        try:
            tags = ""
            for tag in categorytags:
                tags += f" {tag}"
            service = build("customsearch", "v1", developerKey=self.api_key)

            # TikTok 只搜索包含 /video/ 的链接
            sites_to_search = [
                # TikTok 搜索：只搜索视频页面
                f'site:tiktok.com "/video/" {destination} travel {tags}',
                f'site:tiktok.com "@" "/video/" {destination} {tags}',
                # YouTube 搜索
                f"site:youtube.com {destination} travel guide {tags}",
                # Instagram 搜索
                f"site:instagram.com {destination} travel guide {tags}",
                # 其他旅行网站
                f"site:tripadvisor.com {destination} travel guide {tags}",
                f"site:lonelyplanet.com {destination} travel guide {tags}",
            ]

            all_results = []
            for site_query in sites_to_search[:3]:  # 限制查询数量
                try:
                    result = service.cse().list(
                        q=site_query,
                        cx=self.search_engine_id,
                        num=min(3, max_results)  # 每次查询限制结果数
                    ).execute()

                    for item in result.get('items', []):
                        # 确定平台 - 保持原有逻辑
                        platform = "website"
                        link = item.get('link', '')

                        # TikTok 平台检测和过滤
                        if 'tiktok.com' in link:
                            # 只接受包含 /video/ 的 TikTok 链接
                            if '/video/' not in link:
                                continue  # 跳过非视频链接
                            platform = "tiktok"
                        elif 'youtube.com' in link:
                            platform = "youtube"
                        elif 'instagram.com' in link:
                            platform = "instagram"
                        elif 'tripadvisor.com' in link:
                            platform = "tripadvisor"
                        elif 'lonelyplanet.com' in link:
                            platform = "lonelyplanet"

                        # 获取缩略图 - 保持原有逻辑
                        thumbnail = ""
                        if item.get('pagemap'):
                            if item['pagemap'].get('cse_thumbnail'):
                                thumbnail = item['pagemap']['cse_thumbnail'][0].get('src', '')
                            elif item['pagemap'].get('cse_image'):
                                thumbnail = item['pagemap']['cse_image'][0].get('src', '')

                        search_result = {
                            'title': item.get('title', ''),
                            'link': link,
                            'snippet': item.get('snippet', ''),
                            'platform': platform,
                            'thumbnail': thumbnail,
                            # 新增：估算热度用于排序
                            'popularity_score': self.estimate_popularity(item.get('title', ''), item.get('snippet', ''))
                        }
                        all_results.append(search_result)

                except Exception as e:
                    print(f"搜索 {site_query} 失败: {e}")
                    continue

            # 新增：按平台分组并均衡选择
            balanced_results = self.balance_platforms(all_results, max_results)

            # 调试信息：显示各平台数量
            self.debug_platform_distribution(balanced_results)

            return balanced_results[:max_results]

        except Exception as e:
            print(f"Google Search error: {e}")
            return []

    async def search_general_travel_content(self, destination: str, max_results: int = 10):
        """
        搜索一般的旅行相关内容 - TikTok 只搜索包含 /video/ 的链接
        """
        try:
            service = build("customsearch", "v1", developerKey=self.api_key)

            # 修改查询：TikTok 只搜索包含 /video/ 的链接
            queries = [
                f'{destination} travel "/video/" site:tiktok.com',  # 只搜索 TikTok 视频
                f"{destination} travel blog things to do",
                f"{destination} food tour attractions",
                f"{destination} itinerary travel tips"
            ]

            all_results = []
            for query in queries[:2]:
                try:
                    result = service.cse().list(
                        q=query,
                        cx=self.search_engine_id,
                        num=min(5, max_results)
                    ).execute()

                    for item in result.get('items', []):
                        link = item.get('link', '')

                        # 跳过不相关的网站 - 保持原有逻辑
                        if any(skip in link for skip in ['wikipedia.org', 'booking.com', 'agoda.com']):
                            continue

                        platform = "travel_blog"
                        if 'youtube.com' in link:
                            platform = "youtube"
                        elif 'tiktok.com' in link:
                            # 只接受包含 /video/ 的 TikTok 链接
                            if '/video/' not in link:
                                continue  # 跳过非视频链接
                            platform = "tiktok"
                        elif 'instagram.com' in link:
                            platform = "instagram"

                        thumbnail = ""
                        if item.get('pagemap'):
                            if item['pagemap'].get('cse_thumbnail'):
                                thumbnail = item['pagemap']['cse_thumbnail'][0].get('src', '')

                        search_result = {
                            'title': item.get('title', ''),
                            'link': link,
                            'snippet': item.get('snippet', ''),
                            'platform': platform,
                            'thumbnail': thumbnail,
                            # 新增：估算热度用于排序
                            'popularity_score': self.estimate_popularity(item.get('title', ''), item.get('snippet', ''))
                        }
                        all_results.append(search_result)

                except Exception as e:
                    print(f"搜索 {query} 失败: {e}")
                    continue

            # 新增：按热度排序
            sorted_results = sorted(all_results, key=lambda x: x['popularity_score'], reverse=True)
            return sorted_results[:max_results]

        except Exception as e:
            print(f"General Google Search error: {e}")
            return []

    def debug_platform_distribution(self, results):
        """
        调试平台分布
        """
        platform_counts = {}
        for result in results:
            platform = result['platform']
            platform_counts[platform] = platform_counts.get(platform, 0) + 1

        print("=== 平台分布 ===")
        for platform, count in platform_counts.items():
            print(f"{platform}: {count} 个")

        # 输出 TikTok 链接示例
        tiktok_links = [r['link'] for r in results if r['platform'] == 'tiktok']
        if tiktok_links:
            print("TikTok 视频链接示例:")
            for link in tiktok_links[:3]:
                print(f"  - {link}")

    # 保持原有的 balance_platforms 和 estimate_popularity 方法不变
    def balance_platforms(self, results, max_results):
        """
        均衡分布各平台内容
        """
        # 按平台分组
        platform_groups = {}
        for result in results:
            platform = result['platform']
            if platform not in platform_groups:
                platform_groups[platform] = []
            platform_groups[platform].append(result)

        # 对每个平台的内容按热度排序
        for platform in platform_groups:
            platform_groups[platform] = sorted(platform_groups[platform],
                                               key=lambda x: x['popularity_score'],
                                               reverse=True)

        # 计算每个平台应该选择的数量
        platforms = list(platform_groups.keys())
        if not platforms:
            return results[:max_results]

        results_per_platform = max(1, max_results // len(platforms))

        balanced_results = []
        # 从每个平台选择最热门的内容
        for platform in platforms:
            platform_results = platform_groups[platform][:results_per_platform]
            balanced_results.extend(platform_results)

        # 如果数量不够，从剩余内容中按热度补充
        if len(balanced_results) < max_results:
            remaining_slots = max_results - len(balanced_results)
            # 收集所有未选中的内容
            all_remaining = []
            for platform in platforms:
                remaining = platform_groups[platform][results_per_platform:]
                all_remaining.extend(remaining)

            # 按热度排序并补充
            all_remaining_sorted = sorted(all_remaining,
                                          key=lambda x: x['popularity_score'],
                                          reverse=True)
            balanced_results.extend(all_remaining_sorted[:remaining_slots])

        return balanced_results

    def estimate_popularity(self, title: str, snippet: str) -> int:
        """
        估算内容热度（基于标题和描述中的关键词）
        """
        text = (title + " " + snippet).lower()

        # 热度关键词
        hot_keywords = [
            'viral', 'popular', 'trending', 'must-see', 'best', 'top',
            'amazing', 'incredible', 'awesome', 'fantastic', 'recommended',
            'most viewed', 'most liked', 'go viral'
        ]

        # 互动关键词
        engagement_keywords = [
            'like', 'share', 'comment', 'views', 'follow', 'subscribe',
            'million', 'thousand', 'k views'
        ]

        score = 0

        # 检查热度关键词
        for keyword in hot_keywords:
            if keyword in text:
                score += 10

        # 检查互动关键词
        for keyword in engagement_keywords:
            if keyword in text:
                score += 5

        # 标题长度适中加分
        title_length = len(title)
        if 20 <= title_length <= 80:
            score += 5

        return score