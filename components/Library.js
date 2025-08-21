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
  Alert,
  ImageBackground,
  TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import { db, auth } from "../FirebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AppHeader from "./Header";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";


const { width, height } = Dimensions.get("window");


const Library = ({ navigation }) => {
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [removingBookmark, setRemovingBookmark] = useState(null);
  const [inProgressStories, setInProgressStories] = useState([]);
  

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserBookmarks(currentUser.uid);
      } else {
        setBookmarkedStories([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loadUserBookmarks = (userId) => {
    try {
      const bookmarksRef = collection(db, "users", userId, "bookmarks");
      const q = query(bookmarksRef, orderBy("bookmarkedAt", "desc"));

      // Real-time listener for bookmarks
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bookmarks = [];
          snapshot.forEach((doc) => {
            bookmarks.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setBookmarkedStories(bookmarks);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading bookmarks: ", error);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up bookmark listener: ", error);
      setLoading(false);
    }
  };

  const handleViewStory = (story) => {
    // Navigate to the HomeTab, then to the ViewStory screen within HomeStack
    navigation.navigate("HomeTab", {
      screen: "ViewStory",
      params: { storyId: story.id, story: story },
    });
  };

  const handleRemoveBookmark = async (story) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to remove bookmarks.");
      return;
    }

    Alert.alert(
      "Remove Bookmark",
      `Are you sure you want to remove "${story.title}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingBookmark(story.id);
            try {
              const bookmarkRef = doc(
                db,
                "users",
                user.uid,
                "bookmarks",
                story.id
              );
              await deleteDoc(bookmarkRef);
              console.log("Bookmark removed:", story.title);
            } catch (error) {
              console.error("Error removing bookmark: ", error);
              Alert.alert(
                "Error",
                "Failed to remove bookmark. Please try again."
              );
            } finally {
              setRemovingBookmark(null);
            }
          },
        },
      ]
    );
  };

  const renderBookItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.bookItem,
        ((index + 1) % 3 === 0) && { marginRight: 0 } // Remove margin for every third item
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
            colors={["#FF78AF", "#000"]} // Example gradient, same as Home.js
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
          <Text style={styles.storyAuthor} numberOfLines={1}>
            by {item.author}
          </Text>
        )}

        {/* {item.synopsis && (
          <Text style={styles.storySynopsis} numberOfLines={2}>
            {item.synopsis}
          </Text>
        )}

        <View style={styles.bookActions}>
          <TouchableOpacity
            style={styles.readButton}
            onPress={() => handleViewStory(item)}
          >
            <Text style={styles.readButtonText}>View Story</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              removingBookmark === item.id && styles.bookmarkButtonDisabled,
            ]}
            onPress={() => handleRemoveBookmark(item)}
            disabled={removingBookmark === item.id}
          >
            {removingBookmark === item.id ? (
              <ActivityIndicator size="small" color="#FF6DA8" />
            ) : (
              <Ionicons name="bookmark" size={20} color="#FF6DA8" />
            )}
          </TouchableOpacity>
        </View> */}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="library-outline"
        size={64}
        color="#414141"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>Your Favorites is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring stories and bookmark your favorites to see them here!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() =>
          navigation.navigate("KwenturaHome", {
            screen: "HomeTab",
            params: { screen: "Home" },
          })
        }
      >
        <Text style={styles.exploreButtonText}>Explore Stories</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginPrompt = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="lock-closed-outline"
        size={64}
        color="#ccc"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptySubtitle}>
        Please log in to view your bookmarked stories and build your personal
        favorites.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.exploreButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  return (

    <ImageBackground
      source={require('../images/About.png')}
      style={[styles.background, styles.backgroundImage]}
      resizeMode="cover"
    >   

    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        navigation={navigation}
        leftIconType="drawer"
        showSearch={true}
      />

      <ScrollView>
        <Text style={styles.libText}>My Library</Text>

      <View style={styles.searchContainer}>
              <View
                style={[
                  styles.searchInputContainer,
                ]}
              >
                <Ionicons name="search" size={30} color="#919191ff" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stories, authors, and categories..."

                  placeholderTextColor="#999"
                />

              </View>
            </View>


        <Text style={styles.progText}>In Progress</Text>
        {user && inProgressStories.length === 0 && (
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 50, // reduced from 50 for less space below the note
          }}>
            <Text style={{ color: "#666", fontSize: 14, fontStyle: "italic", textAlign: "center", marginBottom: 20 }}>
              You have no unfinished stories.
            </Text>
          </View>
        )}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Favorites</Text>
          {bookmarkedStories.length > 0 && (
            <Text style={styles.countText}>
              {bookmarkedStories.length}{" "}
              {bookmarkedStories.length === 1 ? "story" : "stories"}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFCF2D" />
            <Text style={styles.loadingText}>Loading your favorites...</Text>
          </View>
        ) : !user ? (
          renderLoginPrompt()
        ) : bookmarkedStories.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.storiesGrid}>
            {bookmarkedStories.map(renderBookItem)}
          </View>
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
  section: {
    marginBottom: 20,
    textAlign: "left",
  },
  libText:{
    fontSize: 23,
    marginTop: 10,
    fontFamily: 'Fredoka-SemiBold',
    color: "#222",
    textAlign: "center",
  },
  progText:{
    fontSize: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Fredoka-SemiBold',
    color: "#222",
    textAlign: "left",
    marginTop: 15
  },
  section: {
    marginBottom: 20,
    textAlign: "left",
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
  countText: {
    fontFamily: "sans-serif-medium",
    fontSize: 14,
    color: "#666",
  },
  storiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "flex-start", // align items to the left
  },
  bookItem: {
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
    // Copied from Home.js (style is the same, but used with LinearGradient now)
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    // Copied from Home.js
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    // Copied from Home.js
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  bookInfo: {
    // Copied from Home.js
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
  storySynopsis: {
    fontSize: 12,
    color: "#777",
    marginBottom: 10,
    lineHeight: 16,
    fontStyle: "italic",
  },
  bookActions: {
    // Copied from Home.js
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readButton: {
    // Copied from Home.js
    backgroundColor: "#FF6DA8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 1,
    marginRight: 8,
  },
  readButtonText: {
    // Copied from Home.js
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  bookmarkButton: {
    // Copied from Home.js
    padding: 6,
    minWidth: 28, // Ensures touchable area
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkButtonDisabled: {
    // Copied from Home.js
    opacity: 0.6,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 20
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  exploreButton: {
    width: "50%",
    borderRadius: 10,
    backgroundColor: "#FFCF2D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,

  },
  exploreButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
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
});

export default Library;
