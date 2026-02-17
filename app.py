import streamlit as st
import feedparser
import ssl

# SSL certificate verification workaround for some environments
if hasattr(ssl, '_create_unverified_context'):
    ssl._create_default_https_context = ssl._create_unverified_context

def fetch_rss_data(query):
    """
    Fetches RSS data from Google News based on the query.
    """
    encoded_query = query.replace(" ", "%20")
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(rss_url)
    return feed.entries

def main():
    st.set_page_config(page_title="AI News Dashboard", layout="wide")

    # Custom CSS for card styling
    st.markdown("""
    <style>
    .news-card {
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        margin-bottom: 20px;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }
    .news-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    .news-title {
        font-size: 18px;
        font-weight: bold;
        color: #1a73e8;
        margin-bottom: 10px;
    }
    .news-date {
        font-size: 12px;
        color: #5f6368;
        margin-bottom: 10px;
    }
    .news-summary {
        font-size: 14px;
        color: #3c4043;
        margin-bottom: 15px;
    }
    .news-link {
        text-decoration: none;
        color: white;
        background-color: #1a73e8;
        padding: 8px 16px;
        border-radius: 5px;
        display: inline-block;
    }
    .news-link:hover {
        background-color: #1557b0;
    }
    </style>
    """, unsafe_allow_html=True)

    st.title("🤖 AI News Collection Dashboard")

    # Sidebar
    st.sidebar.header("Search Settings")
    search_query = st.sidebar.text_input("Search Topic", value="Artificial Intelligence")
    
    if search_query:
        st.subheader(f"Latest News for: {search_query}")
        
        with st.spinner("Fetching latest news..."):
            news_items = fetch_rss_data(search_query)
        
        if not news_items:
            st.warning("No news found. Try a different search term.")
        else:
            # Display news in a grid
            cols = st.columns(3)  # Create 3 columns for card layout logic if needed, 
                                  # but for simple vertical list or grid we can iterate.
                                  # Let's use a flexible grid.
            
            for i, item in enumerate(news_items):
                col = cols[i % 3]
                with col:
                    # Parse summary to remove HTML tags if necessary, 
                    # but for now let's display specific fields.
                    # Start formatting the date
                    published_date = item.get('published', 'No date')
                    
                    # Create the card HTML
                    # Using Markdown with HTML for custom styling works best in Streamlit for "Cards"
                    # Note: We need to be careful with HTML injection, but for RSS feed it's generally okay-ish 
                    # though in production we'd sanitize.
                    
                    st.markdown(f"""
                    <div class="news-card">
                        <div class="news-title">{item.title}</div>
                        <div class="news-date">{published_date}</div>
                        <div class="news-summary">{item.get('summary', 'No summary available.')[:150]}...</div>
                        <a href="{item.link}" target="_blank" class="news-link">Read Full Article</a>
                    </div>
                    """, unsafe_allow_html=True)
    else:
        st.info("Please enter a search term in the sidebar.")

if __name__ == "__main__":
    main()
