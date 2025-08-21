import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
  TextInput,  
  ImageBackground,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../FirebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  doc,
  setDoc,
  deleteDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AppHeader from "./Header";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width, height } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedStories, setBookmarkedStories] = useState(new Set());
  const [user, setUser] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [filteredStories, setFilteredStories] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [popularAuthors, setPopularAuthors] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilters, setQuickFilters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [inProgressStories, setInProgressStories] = useState([]);
  const searchTimeoutRef = useRef(null);

    // Keys for AsyncStorage
  const RECENT_SEARCHES_KEY = "@recent_searches";
  const SEARCH_HISTORY_KEY = "@search_history";

  // Category items with icons
  const categoryItems = [
    { name: "All"},
    { name: "Fables"},
    { name: "Folktales"},
    { name: "Inspirational"},
    { name: "Legend"},

  ];
  
    useEffect(() => {
      fetchStories();
      loadStoredSearchData();
    }, []);
  
    useEffect(() => {
      filterStories();
      generateSearchSuggestions();
    }, [searchQuery, stories]);
  
    useEffect(() => {
      generateQuickSearchData();
    }, [stories]);
    
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user's bookmarks when user is authenticated
        loadUserBookmarks(currentUser.uid);
      } else {
        setBookmarkedStories(new Set());
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const storiesCollectionRef = collection(db, "stories");
        const q = query(
          storiesCollectionRef,
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const fetchedStories = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imageUrl: data.image, // Map Firestore 'image' to 'imageUrl'
            synopsis: data.generatedSynopsis || data.synopsis, // Map 'generatedSynopsis' or 'synopsis'
          };
        });

        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching stories: ", error);
        setError("Failed to fetch stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);


  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setFilteredStories(stories);
  };


    const clearSearchHistory = async () => {
      Alert.alert(
        "Clear Search History",
        "Are you sure you want to clear your search history?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: async () => {
              setRecentSearches([]);
              setSearchHistory([]);
              await saveSearchData([], []);
            },
          },
        ]
      );
    };

    
  // Save search data to AsyncStorage
  const saveSearchData = async (searches, history) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving search data:", error);
    }
  };
  

  const loadStoredSearchData = async () => {
    try {
      const storedRecentSearches = await AsyncStorage.getItem(
        RECENT_SEARCHES_KEY
      );
      const storedSearchHistory = await AsyncStorage.getItem(
        SEARCH_HISTORY_KEY
      );

      if (storedRecentSearches) {
        setRecentSearches(JSON.parse(storedRecentSearches));
      }

      if (storedSearchHistory) {
        setSearchHistory(JSON.parse(storedSearchHistory));
      }
    } catch (error) {
      console.error("Error loading search data:", error);
    }
  };

  // Generate search suggestions based on current query
  const generateSearchSuggestions = () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const suggestions = [];

    // Add matching story titles
    stories.forEach((story) => {
      if (story.title && story.title.toLowerCase().includes(query)) {
        suggestions.push({
          type: "story",
          text: story.title,
          icon: "📖",
          data: story,
        });
      }
    });

    // Add matching authors
    const uniqueAuthors = [
      ...new Set(stories.map((s) => s.author).filter(Boolean)),
    ];
    uniqueAuthors.forEach((author) => {
      if (author.toLowerCase().includes(query)) {
        suggestions.push({
          type: "author",
          text: `by ${author}`,
          icon: "✍️",
          data: author,
        });
      }
    });

    // Add matching categories
    const uniqueCategories = [
      ...new Set(stories.map((s) => s.category).filter(Boolean)),
    ];
    uniqueCategories.forEach((category) => {
      if (category.toLowerCase().includes(query)) {
        suggestions.push({
          type: "category",
          text: `${category} stories`,
          icon: "📚",
          data: category,
        });
      }
    });

    setSearchSuggestions(suggestions.slice(0, 6));
  };


  // Generate trending searches, popular authors, and quick filters
  const generateQuickSearchData = () => {
    if (stories.length === 0) return;

    // Generate trending searches based on story titles and categories
    const categoryCount = {};
    const authorCount = {};
    const titleWords = [];

    stories.forEach((story) => {
      // Count categories
      if (story.category) {
        categoryCount[story.category] =
          (categoryCount[story.category] || 0) + 1;
      }

      // Count authors
      if (story.author) {
        authorCount[story.author] = (authorCount[story.author] || 0) + 1;
      }

      // Extract meaningful words from titles
      if (story.title) {
        const words = story.title
          .split(" ")
          .filter(
            (word) =>
              word.length > 3 &&
              ![
                "and",
                "the",
                "of",
                "in",
                "at",
                "to",
                "for",
                "with",
                "by",
              ].includes(word.toLowerCase())
          );
        titleWords.push(...words);
      }
    });

    // Set trending searches (top categories and popular title words)
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const topTitleWords = [...new Set(titleWords)].slice(0, 2);

    setTrendingSearches([...topCategories, ...topTitleWords]);

    // Set popular authors
    const topAuthors = Object.entries(authorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([author]) => author);

    setPopularAuthors(topAuthors);

    // Set quick filters
    const filters = [
      "Latest Stories",
      "Most Popular",
      "Adventure",
      "Fantasy",
    ];
    setQuickFilters(filters);
  };  


  const loadUserBookmarks = (userId) => {
    try {
      const bookmarksRef = collection(db, "users", userId, "bookmarks");

      // Real-time listener for bookmarks
      const unsubscribe = onSnapshot(
        bookmarksRef,
        (snapshot) => {
          const bookmarkIds = new Set();
          snapshot.forEach((doc) => {
            bookmarkIds.add(doc.data().storyId);
          });
          setBookmarkedStories(bookmarkIds);
        },
        (error) => {
          console.error("Error loading bookmarks: ", error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up bookmark listener: ", error);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const storiesCollectionRef = collection(db, "stories");
      const q = query(storiesCollectionRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const fetchedStories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          imageUrl: data.image, // Map Firestore 'image' to 'imageUrl'
          synopsis: data.generatedSynopsis || data.synopsis, // Map 'generatedSynopsis' or 'synopsis'
        };
      });

      setStories(fetchedStories);
      setFilteredStories(fetchedStories);
    } catch (error) {
      console.error("Error fetching stories: ", error);
      setError("Failed to fetch stories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    if (!searchQuery.trim()) {
      if (selectedCategory === "All") {
        setFilteredStories(stories);
      } else {
        const filtered = stories.filter(
          (story) => story.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        setFilteredStories(filtered);
      }
      return;
    }

    const baseStories = selectedCategory === "All" 
      ? stories 
      : stories.filter((story) => story.category?.toLowerCase() === selectedCategory.toLowerCase());

    const filtered = baseStories.filter((story) => {
      const title = story.title?.toLowerCase() || "";
      const author = story.author?.toLowerCase() || "";
      const category = story.category?.toLowerCase() || "";
      const searchTerm = searchQuery.toLowerCase();

      return (
        title.includes(searchTerm) ||
        author.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    });

    setFilteredStories(filtered);
  };

  const handleSearch = (text = "") => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search tracking
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim() && text.length > 2) {
        trackSearch(text.trim());
      }
    }, 1000);
  };

  const trackSearch = async (searchTerm) => {
    const timestamp = new Date().toISOString();
    const searchEntry = {
      term: searchTerm,
      timestamp,
      resultsCount: filteredStories.length,
    };

    // Update recent searches
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5);

    // Update search history
    const updatedHistory = [searchEntry, ...searchHistory].slice(0, 20);

    setRecentSearches(updatedRecent);
    setSearchHistory(updatedHistory);

    // Save to storage
    await saveSearchData(updatedRecent, updatedHistory);
  };

  const renderCategorySection = (categoryName, categoryKey) => {
    const categoryStories = stories.filter(
      (story) => story.category?.toLowerCase() === categoryKey.toLowerCase()
    );

    if (categoryStories.length === 0) return null;

    return (
      <View key={categoryKey} style={styles.categorySection}>
        <View style={styles.categoryline}>
          <Text style={styles.sectionTitle}>{categoryName}</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CategoriesTab", {
                selectedCategory: categoryKey,
              })
            }
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContainer}
        >
          {categoryStories.slice(0, 6).map(renderBookItem)}
        </ScrollView>
      </View>
    );
  };

  const getAllCategories = () => {
    const categories = stories
      .map((story) => story.category)
      .filter((cat) => !!cat);
    return Array.from(new Set(categories));
  };

  const renderStoriesByCategory = () => {
    const categories = getAllCategories();
    return (
      <View style={styles.categoriesContainer}>
        {categories.map((category) =>
          renderCategorySection(category, category)
        )}
      </View>
    );
  };  

  const handleViewStory = (story) => {
    // Navigate directly to ViewStory as it's in the same HomeStack
    navigation.navigate("ViewStory", {
      storyId: story.id,
      story: story,
    });
  };

  const handleBookmark = async (story) => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to bookmark stories.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    setBookmarkLoading(true);

    try {
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", story.id);
      const isBookmarked = bookmarkedStories.has(story.id);

      if (isBookmarked) {
        // Remove bookmark
        await deleteDoc(bookmarkRef);
        console.log("Bookmark removed:", story.title);
      } else {
        // Add bookmark
        const bookmarkData = {
          storyId: story.id,
          title: story.title,
          author: story.author || "Unknown",
          imageUrl: story.imageUrl || null,
          category: story.category || "Story",
          synopsis: story.synopsis || "No synopsis available.",
          bookmarkedAt: new Date(),
          createdAt: story.createdAt,
        };

        await setDoc(bookmarkRef, bookmarkData);
        console.log("Story bookmarked:", story.title);
      }
    } catch (error) {
      console.error("Error handling bookmark: ", error);
      Alert.alert("Error", "Failed to update bookmark. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const renderBookItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.bookItem1,
        (index + 1) % 3 === 0 && { marginRight: 0 } // Remove margin for every third item
      ]}
      onPress={() => handleViewStory(item)}
      activeOpacity={0.8}
    >
      <View style={styles.bookImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.bookImage}
            onError={() => console.log("Failed to load image:", item.imageUrl)}
          />
        ) : (
          <LinearGradient
            colors={["#FF78AF", "#000"]}
            style={[styles.bookImage, styles.placeholderImage]}
          >
            <Ionicons name="book-outline" size={40} color="#ccc" />
          </LinearGradient>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.title || "Untitled Story"}
        </Text>

        {item.author && (
          <Text style={styles.storyAuthor} numberOfLines={1}>{item.author}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredStories(stories);
    } else {
      const filtered = stories.filter(
        (story) => story.category?.toLowerCase() === category.toLowerCase()
      );
      setFilteredStories(filtered);
      navigation.navigate("CategoriesTab", { selectedCategory: category });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    if (typeof suggestion === 'string') {
      setSearchQuery(suggestion);
      setIsSearchFocused(false);
    } else if (suggestion.data) {
      if (suggestion.type === 'story') {
        handleViewStory(suggestion.data);
      } else if (suggestion.type === 'author') {
        setSearchQuery(suggestion.data);
      } else if (suggestion.type === 'category') {
        handleCategoryPress(suggestion.data);
      }
      setIsSearchFocused(false);
    }
  };

  const handleQuickFilter = (filter) => {
    setSearchQuery(filter);
    setIsSearchFocused(false);
  };

  const categoryData = [
    {
      name: "Fables",
      image: require("../books/bawal.png"),
      gradient: ["#FF6B6B", "#FF8E8E"],
    },
    {
      name: "Folktales",
      image: require("../books/buhok.png"),
      gradient: ["#4ECDC4", "#44A08D"],
    },
    {
      name: "Inspirational",
      image: require("../books/rihawani.png"),
      gradient: ["#FFD93D", "#FF9A3D"],
    },
    {
      name: "Legend",
      image: require("../books/pinya.png"),
      gradient: ["#A8E6CF", "#88D8A3"],
    },

  ];

  const CATEGORY_CARD_WIDTH = width * 0.8;
  const CATEGORY_CARD_SPACING = 16;

  const renderCategoryCarouselCard = (category, image, gradient) => (
    <TouchableOpacity
      key={category}
      style={{
        width: CATEGORY_CARD_WIDTH,
        marginRight: CATEGORY_CARD_SPACING,
        borderRadius:15,
        overflow: "hidden",
        elevation: 3,
        backgroundColor: "#fff",
      }}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradient}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={image}
          style={{
            width: "100%",
            height: 140,
            resizeMode: "cover",
            borderRadius: 10,
          }}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSuggestionChip = (item, index, type = "default") => {
    const isRecent = type === "recent";
    const isTrending = type === "trending";
    const isAuthor = type === "author";
    const isFilter = type === "filter";

    let chipStyle = styles.suggestionChip;
    let textStyle = styles.suggestionChipText;
    let prefix = "";

    if (isRecent) {
      chipStyle = [styles.suggestionChip, styles.recentChip];
      textStyle = [styles.suggestionChipText, styles.recentChipText];
      prefix = "🕒 ";
    } else if (isTrending) {
      chipStyle = [styles.suggestionChip, styles.trendingChip];
      textStyle = [styles.suggestionChipText, styles.trendingChipText];
      prefix = "🔥 ";
    } else if (isAuthor) {
      chipStyle = [styles.suggestionChip, styles.authorChip];
      textStyle = [styles.suggestionChipText, styles.authorChipText];
      prefix = "✍️ ";
    } else if (isFilter) {
      chipStyle = [styles.suggestionChip, styles.filterChip];
      textStyle = [styles.suggestionChipText, styles.filterChipText];
      prefix = "⚡ ";
    }

    return (
      <TouchableOpacity
        key={`${type}-${index}`}
        style={chipStyle}
        onPress={() =>
          isFilter ? handleQuickFilter(item) : handleSuggestionPress(item)
        }
      >
        <Text style={textStyle}>
          {prefix}
          {typeof item === "string" ? item : item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestion = (suggestion, index) => (
    <TouchableOpacity
      key={index}
      style={styles.searchSuggestionItem}
      onPress={() => handleSuggestionPress(suggestion)}
    >
      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
      <Text style={styles.searchSuggestionText}>{suggestion.text}</Text>
      <Ionicons
        name="arrow-up-outline"
        size={16}
        color="#999"
        style={styles.suggestionArrow}
      />
    </TouchableOpacity>
  );


  return (
    <ImageBackground
      source={require('../images/About.png')}
      style={[styles.background, styles.backgroundImage]}
      resizeMode="cover"
    >
    
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >

      <AppHeader
        navigation={navigation}
        leftIconType="drawer"
        showSearch={true}
      />

      <View style={styles.searchContainer}>
              <View
                style={[
                  styles.searchInputContainer,
                  isSearchFocused && styles.searchInputFocused,
                ]}
              >
                <Ionicons name="search" size={30} color="#919191ff" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stories, authors, and categories..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>


{/* Enhanced Quick Search Suggestions */}
      {isSearchFocused && (
        <View style={styles.suggestionsContainer}>
          {/* Live Search Suggestions */}
          {searchQuery.trim() && searchSuggestions.length > 0 && (
            <View style={styles.liveSearchContainer}>
              <Text style={styles.suggestionSectionTitle}>Suggestions</Text>
              {searchSuggestions.map(renderSearchSuggestion)}
            </View>
          )}

          {/* Recent Searches */}
          {!searchQuery.trim() && recentSearches.length > 0 && (
            <>
              <View style={styles.sectionHeaderWithAction}>
                <Text style={styles.suggestionSectionTitle}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearHistoryText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionScrollView}
              >
                {recentSearches.map((item, index) =>
                  renderSuggestionChip(item, index, "recent")
                )}
              </ScrollView>
            </>
          )}
        </View>
      )}

      {/* Search Results Header */}
      {searchQuery.trim() && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsText}>
            Found {filteredStories.length} result
            {filteredStories.length !== 1 ? "s" : ""} for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Enhanced Category Row */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categoryItems.map((category, index) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(category.name)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
              {selectedCategory === category.name && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore now</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CATEGORY_CARD_WIDTH + CATEGORY_CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {categoryData.map((category) =>
              renderCategoryCarouselCard(
                category.name,
                category.image,
                category.gradient
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Featured Stories ({filteredStories.length})
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFCF2D" />
              <Text style={styles.loadingText}>
                Discovering amazing stories...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color="#ccc"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  fetchStories();
                }}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredStories.length > 0 ? (
            <View style={styles.storiesGrid}>
              {filteredStories.map(renderBookItem)}
            </View>
          ) : (
            <View style={styles.noStoriesContainer}>
              <Text style={styles.noStoriesIcon}>📖</Text>
              <Text style={styles.noStoriesText}>No stories found</Text>
              <Text style={styles.noStoriesSubtext}>
                Check your internet connection or try again later
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFCF2D" />
            <Text style={styles.loadingText}>
              Discovering amazing stories...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📚</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : searchQuery.trim() ? (
          filteredStories.length > 0 ? (
            <View style={styles.searchResultsContainer}>
              {filteredStories.map(renderBookItem)}
            </View>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={40} color="#ccc" />
              <Text style={styles.noResultsText}>No stories found</Text>
              <Text style={styles.noResultsSubtext}>
                Try different keywords or browse our categories below
              </Text>
            </View>
          )
        ) : (
          renderStoriesByCategory()
        )}

        
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  section: {
    textAlign: "left",
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10, // tighter spacing
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Fredoka-SemiBold',
    color: "#222",
    textAlign: "left",
  },
  viewAllText: {
    fontSize: 12,
    color: "darkGray",
    fontWeight: "600",
  },
  storiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "flex-start", // align items to the left
  },
  bookItem1: {
    borderRadius: 8,
    textAlign: "center",
    width: width * 0.32,
    borderRadius: 12,
    marginRight: 20, // <-- 30px horizontal space between stories
    marginBottom: 20, // optional: vertical space between rows
  },
  bookImageContainer: {
    position: "relative",
    marginBottom: 5,
  },
  bookImage: {
    width: "100%",
    height: height * 0.20,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  bookInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    lineHeight: 16,
    textAlign: "center",
  },
  storyAuthor: {
    fontSize: 10,
    color: "black",
    fontStyle: "italic",
    textAlign: "center",
  },
  bookActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readButton: {
    backgroundColor: "#FF6DA8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 1,
    marginRight: 8,
  },
  readButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  bookmarkButton: {
    padding: 6,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkButtonDisabled: {
    opacity: 0.6,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  noStoriesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noStoriesIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noStoriesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  noStoriesSubtext: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop:20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d1d1d1ff",
    height: 50
  },
  searchInputFocused: {
    borderColor: "#FF6B6B",
    shadowOpacity: 0.15,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    fontFamily: "sans-serif",
  },
  searchIcon: {
    marginRight: 12,
    color: "#414141",
    width: 24,
    height: 24,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
  },
  Rainbow: {
    position: 'absolute',
    top: -140,
    width: '100%',
    height: '25%',
    alignSelf: 'center',
  },
  star1: {
    position: 'absolute',
    top: '7%',
    left: '23%',
    width: 15,
    height: 15,
  },
  star2: {
    position: 'absolute',
    top: '11%',
    right: '3%',
    width: 15,
    height: 15,
  },
  star3: {
    position: 'absolute',
    top: '7%',
    left: '3%',
    width: 10,
    height: 10,
  },
  star4: {
    position: 'absolute',
    top: '1%',
    left: '43%',
    width: 10,
    height: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  noResultsSubtext: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  liveSearchContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  searchSuggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 10,
    color: "#555",
  },
  searchSuggestionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  suggestionArrow: {
    transform: [{ rotate: "45deg" }],
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearHistoryText: {
    fontSize: 13,
    color: "blue",
    fontWeight: "500",
  },
  categoriesContainer: {
    paddingHorizontal: 20
  },
   categoryline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",   
    marginBottom: 10 
  },
  clearButtonText: {
    color: "#999",
    verticalAlign: "center",
    fontWeight: "bold",
    fontSize: 18
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  suggestionSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  suggestionScrollView: {
    marginBottom: 15,
  },
  suggestionChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  recentChip: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFE0E0",
  },
  suggestionChipText: {
    fontSize: 14,
    color: "#666",
  },
  recentChipText: {
    color: "#FF6B6B",
  },
  trendingChip: { backgroundColor: "#E6FFFA", borderColor: "#B2F5EA" },
  trendingChipText: { color: "#2C7A7B" },
  authorChip: { backgroundColor: "#FEFCE8", borderColor: "#FDE68A" },
  authorChipText: { color: "#A16207" },
  filterChip: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  filterChipText: { color: "#1E40AF" },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchResultsText: {
    fontSize: 13,
    color: "#333",
    fontStyle: "italic",
    marginTop: 10,
    width: '100%',
  },
  searchResultsContainer: {
    backgroundColor: '#fff', // Add a white background
    borderRadius: 10,         // Optional: Add rounded corners
    justifyContent: 'center',
  },
  
  // Enhanced Category Styles
  categoryContainer: {
    backgroundColor: 'transparent',
    marginTop: 15
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#FFCF2D',
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Fredoka-Medium', // Match your app's font
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -3 }],
    width: 6,
    height: 6,
    // backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});

export default Home;