import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import CustomerLayout from "../components/CustomerLayout";
import { auth, db } from "../firebase";

export default function CustomerCommunityBuilds() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [customerName, setCustomerName] = useState("");

  const [communityBuilds, setCommunityBuilds] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [modelFilter, setModelFilter] = useState("All");
  const [goalFilter, setGoalFilter] = useState("All");

  const [selectedBuild, setSelectedBuild] = useState(null);

  const [userReactions, setUserReactions] = useState({});

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [newComment, setNewComment] = useState("");

  const [savingBuild, setSavingBuild] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [votingBuildId, setVotingBuildId] = useState(null);

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setCustomerName("");
        return;
      }

      try {
        const customerRef = doc(db, "customers", user.uid);
        const customerSnapshot = await getDoc(customerRef);

        if (customerSnapshot.exists()) {
          const data = customerSnapshot.data();

          setCustomerName(
            data.fullName ||
              user.displayName ||
              user.email?.split("@")[0] ||
              "Customer"
          );
        } else {
          setCustomerName(
            user.displayName ||
              user.email?.split("@")[0] ||
              "Customer"
          );
        }
      } catch (error) {
        console.error(
          "Error loading customer profile:",
          error
        );

        setCustomerName(
          user.displayName ||
            user.email?.split("@")[0] ||
            "Customer"
        );
      }
    });

    return unsubscribe;
  }, []);

  // --------------------------------------------------
  // COMMUNITY BUILDS REAL-TIME LISTENER
  // --------------------------------------------------

  useEffect(() => {
    const communityQuery = query(
      collection(db, "communityBuilds")
    );

    const unsubscribe = onSnapshot(
      communityQuery,
      (snapshot) => {
        const builds = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,

            userId:
              data.userId ||
              data.customerId ||
              data.customerUid ||
              "",

            userName:
              data.userName ||
              data.builderName ||
              "MPRSS Customer",

            motorcycleBrand:
              data.motorcycleBrand || "",

            motorcycleModel:
              data.motorcycleModel || "",

            motorcycleYear:
              data.motorcycleYear || "",

            buildGoal:
              data.buildGoal ||
              data.goal ||
              "Performance",

            parts: Array.isArray(data.parts)
              ? data.parts
              : [],

            compatibilityScore:
              Number(data.compatibilityScore) || 0,

            safetyNotes:
              data.safetyNotes || "No safety notes provided.",

            dateShared:
              formatDate(data.dateShared || data.sharedAt),

            upvotes:
              Number(data.upvotes) || 0,

            downvotes:
              Number(data.downvotes) || 0,

            comments:
              Array.isArray(data.comments)
                ? data.comments
                : [],

            description:
              data.description || "",

            estimatedCost:
              Number(data.estimatedCost) || 0,

            difficultyLevel:
              data.difficultyLevel || "Intermediate",

            reactionByUser:
              data.reactionByUser || {},
          };
        });

        setCommunityBuilds(builds);
      },
      (error) => {
        console.error(
          "Error listening to community builds:",
          error
        );

        Alert.alert(
          "Community Builds",
          "Unable to load community builds right now."
        );
      }
    );

    return unsubscribe;
  }, []);

  // --------------------------------------------------
  // LOAD CURRENT USER'S REACTIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!currentUser || communityBuilds.length === 0) {
      return;
    }

    const reactions = {};

    communityBuilds.forEach((build) => {
      if (
        build.reactionByUser &&
        build.reactionByUser[currentUser.uid]
      ) {
        reactions[build.id] =
          build.reactionByUser[currentUser.uid];
      }
    });

    setUserReactions(reactions);
  }, [currentUser, communityBuilds]);

  // --------------------------------------------------
  // FILTER DATA
  // --------------------------------------------------

  const brands = useMemo(() => {
    return [
      "All",
      ...new Set(
        communityBuilds
          .map((build) => build.motorcycleBrand)
          .filter(Boolean)
      ),
    ];
  }, [communityBuilds]);

  const models = useMemo(() => {
    const builds =
      brandFilter === "All"
        ? communityBuilds
        : communityBuilds.filter(
            (build) =>
              build.motorcycleBrand === brandFilter
          );

    return [
      "All",
      ...new Set(
        builds
          .map((build) => build.motorcycleModel)
          .filter(Boolean)
      ),
    ];
  }, [communityBuilds, brandFilter]);

  const goals = [
    "All",
    "Performance",
    "Safety",
    "Aesthetic",
  ];

  const filteredBuilds = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...communityBuilds]
      .filter(
        (build) =>
          brandFilter === "All" ||
          build.motorcycleBrand === brandFilter
      )
      .filter(
        (build) =>
          modelFilter === "All" ||
          build.motorcycleModel === modelFilter
      )
      .filter(
        (build) =>
          goalFilter === "All" ||
          build.buildGoal === goalFilter
      )
      .filter((build) => {
        if (!search) {
          return true;
        }

        return (
          build.motorcycleBrand
            .toLowerCase()
            .includes(search) ||
          build.motorcycleModel
            .toLowerCase()
            .includes(search) ||
          build.description
            .toLowerCase()
            .includes(search) ||
          build.userName
            .toLowerCase()
            .includes(search) ||
          build.buildGoal
            .toLowerCase()
            .includes(search)
        );
      })
      .sort(
        (a, b) =>
          b.upvotes -
          b.downvotes -
          (a.upvotes - a.downvotes)
      );
  }, [
    communityBuilds,
    searchTerm,
    brandFilter,
    modelFilter,
    goalFilter,
  ]);

  // --------------------------------------------------
  // VOTING
  // --------------------------------------------------

  const handleVote = async (buildId, voteType) => {
    if (!currentUser) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to vote on community builds."
      );
      return;
    }

    if (votingBuildId) {
      return;
    }

    setVotingBuildId(buildId);

    try {
      const buildRef = doc(
        db,
        "communityBuilds",
        buildId
      );

      await runTransaction(db, async (transaction) => {
        const snapshot =
          await transaction.get(buildRef);

        if (!snapshot.exists()) {
          throw new Error(
            "Community build no longer exists."
          );
        }

        const data = snapshot.data();

        const reactionByUser = {
          ...(data.reactionByUser || {}),
        };

        const currentReaction =
          reactionByUser[currentUser.uid] || null;

        let upvotes = Number(data.upvotes) || 0;
        let downvotes =
          Number(data.downvotes) || 0;

        if (currentReaction === voteType) {
          delete reactionByUser[currentUser.uid];

          if (voteType === "upvote") {
            upvotes = Math.max(0, upvotes - 1);
          }

          if (voteType === "downvote") {
            downvotes = Math.max(0, downvotes - 1);
          }
        } else {
          if (currentReaction === "upvote") {
            upvotes = Math.max(0, upvotes - 1);
          }

          if (currentReaction === "downvote") {
            downvotes = Math.max(0, downvotes - 1);
          }

          reactionByUser[currentUser.uid] =
            voteType;

          if (voteType === "upvote") {
            upvotes += 1;
          }

          if (voteType === "downvote") {
            downvotes += 1;
          }
        }

        transaction.update(buildRef, {
          upvotes,
          downvotes,
          reactionByUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error(
        "Error updating community vote:",
        error
      );

      Alert.alert(
        "Vote Failed",
        "Unable to update your vote. Please try again."
      );
    } finally {
      setVotingBuildId(null);
    }
  };

  // --------------------------------------------------
  // ADD COMMENT
  // --------------------------------------------------

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedBuild) {
      return;
    }

    if (!currentUser) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to comment."
      );
      return;
    }

    if (postingComment) {
      return;
    }

    setPostingComment(true);

    try {
      const comment = {
        id: `comment-${currentUser.uid}-${Date.now()}`,
        userId: currentUser.uid,
        userName:
          customerName ||
          currentUser.displayName ||
          currentUser.email?.split("@")[0] ||
          "Customer",
        text: newComment.trim(),
        timestamp: new Date().toLocaleString(),
      };

      const buildRef = doc(
        db,
        "communityBuilds",
        selectedBuild.id
      );

      await runTransaction(db, async (transaction) => {
        const snapshot =
          await transaction.get(buildRef);

        if (!snapshot.exists()) {
          throw new Error(
            "Community build no longer exists."
          );
        }

        const data = snapshot.data();

        const existingComments =
          Array.isArray(data.comments)
            ? data.comments
            : [];

        transaction.update(buildRef, {
          comments: [
            ...existingComments,
            comment,
          ],
          updatedAt: serverTimestamp(),
        });
      });

      setNewComment("");
      setShowCommentModal(false);
    } catch (error) {
      console.error(
        "Error adding community comment:",
        error
      );

      Alert.alert(
        "Comment Failed",
        "Unable to post your comment. Please try again."
      );
    } finally {
      setPostingComment(false);
    }
  };

  // --------------------------------------------------
  // SAVE TO MY BUILDS
  // --------------------------------------------------

  const handleSaveToBuild = async () => {
    if (!selectedBuild || !currentUser) {
      return;
    }

    if (savingBuild) {
      return;
    }

    setSavingBuild(true);

    try {
      const existingBuildsQuery = query(
        collection(db, "builds"),
        where(
          "customerId",
          "==",
          currentUser.uid
        )
      );

      const existingSnapshot =
        await new Promise((resolve, reject) => {
          const unsubscribe = onSnapshot(
            existingBuildsQuery,
            (snapshot) => {
              unsubscribe();
              resolve(snapshot);
            },
            (error) => {
              unsubscribe();
              reject(error);
            }
          );
        });

      const alreadySaved =
        existingSnapshot.docs.some((document) => {
          const data = document.data();

          return (
            data.communityBuildId ===
            selectedBuild.id
          );
        });

      if (alreadySaved) {
        setShowSaveModal(false);

        Alert.alert(
          "Already Saved",
          "This community build is already in your My Builds collection."
        );

        return;
      }

      const parts = Array.isArray(
        selectedBuild.parts
      )
        ? selectedBuild.parts.map((part) => {
            if (typeof part === "string") {
              return part;
            }

            return part?.name || "Unnamed Part";
          })
        : [];

      await addDoc(collection(db, "builds"), {
        customerId: currentUser.uid,
        customerUid: currentUser.uid,
        customerEmail: currentUser.email || "",

        communityBuildId: selectedBuild.id,

        motorcycleId: null,

        motorcycleName:
          `${selectedBuild.motorcycleBrand} ${selectedBuild.motorcycleModel}`.trim(),

        motorcycleBrand:
          selectedBuild.motorcycleBrand,

        motorcycleModel:
          selectedBuild.motorcycleModel,

        motorcycleYear:
          selectedBuild.motorcycleYear,

        buildName:
          `${selectedBuild.motorcycleBrand} ${selectedBuild.motorcycleModel} - ${selectedBuild.buildGoal}`,

        goal: selectedBuild.buildGoal,

        parts,

        aiResult:
          selectedBuild.description ||
          "Community build shared by another MPRSS rider.",

        notes:
          selectedBuild.safetyNotes || "",

        compatibilityScore:
          selectedBuild.compatibilityScore,

        estimatedCost:
          selectedBuild.estimatedCost,

        difficultyLevel:
          selectedBuild.difficultyLevel,

        dateSaved:
          new Date().toISOString().split("T")[0],

        source: "community",

        sourceUserId:
          selectedBuild.userId || null,

        sourceUserName:
          selectedBuild.userName || "",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowSaveModal(false);

      Alert.alert(
        "Build Saved",
        "This community build has been added to My Builds."
      );
    } catch (error) {
      console.error(
        "Error saving community build:",
        error
      );

      Alert.alert(
        "Save Failed",
        "Unable to save this build. Please try again."
      );
    } finally {
      setSavingBuild(false);
    }
  };

  // --------------------------------------------------
  // REQUEST SERVICE
  // --------------------------------------------------

  const handleServiceRequest = () => {
    setShowServiceModal(false);

    if (!selectedBuild) {
      return;
    }

    router.push("/services");
  };

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setBrandFilter("All");
    setModelFilter("All");
    setGoalFilter("All");
  };

  // --------------------------------------------------
  // HELPER
  // --------------------------------------------------

  const getPartName = (part) => {
    if (typeof part === "string") {
      return part;
    }

    return part?.name || "Unnamed Part";
  };

  const getPartCategory = (part) => {
    if (typeof part === "string") {
      return "Part";
    }

    return part?.category || "Part";
  };

  return (
    <CustomerLayout title="Community Builds">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!selectedBuild ? (
          <>
            {/* Intro */}
            <View style={styles.intro}>
              <Text style={styles.introTitle}>
                Explore Rider Builds
              </Text>

              <Text style={styles.introSubtitle}>
                Discover motorcycle setups shared by
                the MPRSS community, from performance
                upgrades to safety and aesthetic
                builds.
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchCard}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>
                  ⌕
                </Text>

                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search builds, models, or builders..."
                  placeholderTextColor="#9ca3af"
                  style={styles.searchInput}
                />
              </View>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() =>
                  setShowFilterModal(true)
                }
              >
                <Text style={styles.filterIcon}>
                  ☷
                </Text>

                <Text
                  style={styles.filterButtonText}
                >
                  Filters
                </Text>

                {(brandFilter !== "All" ||
                  modelFilter !== "All" ||
                  goalFilter !== "All") && (
                  <View style={styles.filterDot} />
                )}
              </TouchableOpacity>
            </View>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {filteredBuilds.length} Build
                {filteredBuilds.length !== 1
                  ? "s"
                  : ""}{" "}
                Found
              </Text>

              <View style={styles.popularity}>
                <Text style={styles.trendingIcon}>
                  ↗
                </Text>

                <Text style={styles.popularityText}>
                  Sorted by popularity
                </Text>
              </View>
            </View>

            {/* Build Cards */}
            {filteredBuilds.map((build) => (
              <View
                key={build.id}
                style={styles.buildCard}
              >
                <View
                  style={styles.buildCardHeader}
                >
                  <View
                    style={styles.buildHeaderInfo}
                  >
                    <Text
                      style={styles.buildCardTitle}
                    >
                      {build.motorcycleBrand}{" "}
                      {build.motorcycleModel}
                    </Text>

                    <Text
                      style={styles.builderName}
                    >
                      by {build.userName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.goalBadge,
                      build.buildGoal ===
                        "Performance" &&
                        styles.performanceBadge,
                      build.buildGoal ===
                        "Safety" &&
                        styles.safetyBadge,
                      build.buildGoal ===
                        "Aesthetic" &&
                        styles.aestheticBadge,
                    ]}
                  >
                    <Text
                      style={
                        styles.goalBadgeText
                      }
                    >
                      {build.buildGoal}
                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.buildDescription}
                >
                  {build.description}
                </Text>

                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    ◼ {build.parts.length} parts
                  </Text>

                  <Text style={styles.statText}>
                    ↗ {build.compatibilityScore}%
                    compatible
                  </Text>

                  <Text style={styles.statText}>
                    ◌ {build.comments.length}
                  </Text>
                </View>

                <View style={styles.buildFooter}>
                  <View style={styles.voteGroup}>
                    <TouchableOpacity
                      disabled={
                        votingBuildId ===
                        build.id
                      }
                      style={[
                        styles.voteButton,
                        userReactions[
                          build.id
                        ] === "upvote" &&
                          styles.upvoteActive,
                      ]}
                      onPress={() =>
                        handleVote(
                          build.id,
                          "upvote"
                        )
                      }
                    >
                      <Text
                        style={styles.voteIcon}
                      >
                        ↑
                      </Text>

                      <Text
                        style={[
                          styles.voteText,
                          userReactions[
                            build.id
                          ] === "upvote" &&
                            styles.voteTextLight,
                        ]}
                      >
                        {build.upvotes}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={
                        votingBuildId ===
                        build.id
                      }
                      style={[
                        styles.voteButton,
                        userReactions[
                          build.id
                        ] === "downvote" &&
                          styles.downvoteActive,
                      ]}
                      onPress={() =>
                        handleVote(
                          build.id,
                          "downvote"
                        )
                      }
                    >
                      <Text
                        style={styles.voteIcon}
                      >
                        ↓
                      </Text>

                      <Text
                        style={[
                          styles.voteText,
                          userReactions[
                            build.id
                          ] === "downvote" &&
                            styles.voteTextLight,
                        ]}
                      >
                        {build.downvotes}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      setSelectedBuild(build)
                    }
                  >
                    <Text
                      style={
                        styles.viewButtonText
                      }
                    >
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {filteredBuilds.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>
                  ♙
                </Text>

                <Text style={styles.emptyText}>
                  No builds found matching your
                  criteria
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Back */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                setSelectedBuild(null)
              }
            >
              <Text style={styles.backIcon}>
                ←
              </Text>

              <Text style={styles.backText}>
                Back to Community Feed
              </Text>
            </TouchableOpacity>

            {/* Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <View
                  style={styles.detailsHeaderInfo}
                >
                  <Text
                    style={styles.detailsTitle}
                  >
                    {selectedBuild.motorcycleBrand}{" "}
                    {selectedBuild.motorcycleModel}
                  </Text>

                  <Text
                    style={styles.detailsSubtitle}
                  >
                    {selectedBuild.motorcycleYear}{" "}
                    • by{" "}
                    {selectedBuild.userName}
                  </Text>
                </View>

                <View
                  style={[
                    styles.goalBadgeLarge,
                    selectedBuild.buildGoal ===
                      "Performance" &&
                      styles.performanceBadge,
                    selectedBuild.buildGoal ===
                      "Safety" &&
                      styles.safetyBadge,
                    selectedBuild.buildGoal ===
                      "Aesthetic" &&
                      styles.aestheticBadge,
                  ]}
                >
                  <Text
                    style={
                      styles.goalBadgeText
                    }
                  >
                    {selectedBuild.buildGoal}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.detailsDescription}
              >
                {selectedBuild.description}
              </Text>

              <View style={styles.detailsStats}>
                <View
                  style={styles.detailStatBox}
                >
                  <Text
                    style={styles.detailStatLabel}
                  >
                    Compatibility
                  </Text>

                  <Text
                    style={styles.detailStatValue}
                  >
                    {selectedBuild.compatibilityScore}%
                  </Text>
                </View>

                <View
                  style={styles.detailStatBox}
                >
                  <Text
                    style={styles.detailStatLabel}
                  >
                    Est. Cost
                  </Text>

                  <Text
                    style={styles.detailStatValue}
                  >
                    ₱
                    {selectedBuild.estimatedCost.toLocaleString()}
                  </Text>
                </View>

                <View
                  style={styles.detailStatBox}
                >
                  <Text
                    style={styles.detailStatLabel}
                  >
                    Difficulty
                  </Text>

                  <Text
                    style={
                      styles.detailStatValueSmall
                    }
                  >
                    {
                      selectedBuild.difficultyLevel
                    }
                  </Text>
                </View>

                <View
                  style={styles.detailStatBox}
                >
                  <Text
                    style={styles.detailStatLabel}
                  >
                    Date Shared
                  </Text>

                  <Text
                    style={
                      styles.detailStatValueSmall
                    }
                  >
                    {selectedBuild.dateShared}
                  </Text>
                </View>
              </View>
            </View>

            {/* Parts */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>
                Parts Used
              </Text>

              {selectedBuild.parts.map(
                (part, index) => (
                  <View
                    key={`${selectedBuild.id}-part-${index}`}
                    style={
                      styles.detailPartRow
                    }
                  >
                    <View
                      style={styles.partIcon}
                    >
                      <Text
                        style={
                          styles.partIconText
                        }
                      >
                        ▣
                      </Text>
                    </View>

                    <View
                      style={styles.partInfo}
                    >
                      <Text
                        style={styles.partName}
                      >
                        {getPartName(part)}
                      </Text>

                      <Text
                        style={
                          styles.partCategory
                        }
                      >
                        {getPartCategory(part)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* Safety */}
            <View style={styles.safetyNotesBox}>
              <Text
                style={styles.safetyNotesTitle}
              >
                ⚠ Safety Notes
              </Text>

              <Text
                style={styles.safetyNotesText}
              >
                {selectedBuild.safetyNotes}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.detailsCard}>
              <View style={styles.detailVoteRow}>
                <TouchableOpacity
                  disabled={
                    votingBuildId ===
                    selectedBuild.id
                  }
                  style={[
                    styles.detailVoteButton,
                    userReactions[
                      selectedBuild.id
                    ] === "upvote" &&
                      styles.upvoteActive,
                  ]}
                  onPress={() =>
                    handleVote(
                      selectedBuild.id,
                      "upvote"
                    )
                  }
                >
                  <Text style={styles.voteIcon}>
                    ↑
                  </Text>

                  <Text
                    style={[
                      styles.detailVoteText,
                      userReactions[
                        selectedBuild.id
                      ] === "upvote" &&
                        styles.voteTextLight,
                    ]}
                  >
                    {selectedBuild.upvotes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={
                    votingBuildId ===
                    selectedBuild.id
                  }
                  style={[
                    styles.detailVoteButton,
                    userReactions[
                      selectedBuild.id
                    ] === "downvote" &&
                      styles.downvoteActive,
                  ]}
                  onPress={() =>
                    handleVote(
                      selectedBuild.id,
                      "downvote"
                    )
                  }
                >
                  <Text style={styles.voteIcon}>
                    ↓
                  </Text>

                  <Text
                    style={[
                      styles.detailVoteText,
                      userReactions[
                        selectedBuild.id
                      ] === "downvote" &&
                        styles.voteTextLight,
                    ]}
                  >
                    {selectedBuild.downvotes}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.darkButton}
                onPress={() =>
                  setShowSaveModal(true)
                }
              >
                <Text style={styles.buttonIcon}>
                  ▣
                </Text>

                <Text
                  style={styles.darkButtonText}
                >
                  Save to My Builds
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.darkButton}
                onPress={() =>
                  setShowServiceModal(true)
                }
              >
                <Text style={styles.buttonIcon}>
                  →
                </Text>

                <Text
                  style={styles.darkButtonText}
                >
                  Request Service
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments */}
            <View style={styles.detailsCard}>
              <View
                style={styles.commentsHeader}
              >
                <Text style={styles.sectionTitle}>
                  Comments (
                  {selectedBuild.comments.length}
                  )
                </Text>

                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() =>
                    setShowCommentModal(true)
                  }
                >
                  <Text
                    style={
                      styles.commentButtonText
                    }
                  >
                    Add Comment
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedBuild.comments.length ===
              0 ? (
                <Text style={styles.noComments}>
                  No comments yet. Be the first
                  to comment!
                </Text>
              ) : (
                selectedBuild.comments.map(
                  (comment, index) => (
                    <View
                      key={
                        comment.id ||
                        `${selectedBuild.id}-comment-${index}`
                      }
                      style={styles.commentCard}
                    >
                      <View
                        style={
                          styles.commentTop
                        }
                      >
                        <Text
                          style={
                            styles.commentUser
                          }
                        >
                          {comment.userName ||
                            "Customer"}
                        </Text>

                        <Text
                          style={
                            styles.commentDate
                          }
                        >
                          {comment.timestamp ||
                            ""}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.commentText
                        }
                      >
                        {comment.text}
                      </Text>
                    </View>
                  )
                )
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Filter Builds
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowFilterModal(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>
              Motorcycle Brand
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.filterChip,
                    brandFilter === brand &&
                      styles.filterChipActive,
                  ]}
                  onPress={() => {
                    setBrandFilter(brand);
                    setModelFilter("All");
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      brandFilter === brand &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>
              Motorcycle Model
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {models.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.filterChip,
                    modelFilter === model &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setModelFilter(model)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      modelFilter === model &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>
              Build Goal
            </Text>

            <View style={styles.goalFilterGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.filterChip,
                    goalFilter === goal &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setGoalFilter(goal)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      goalFilter === goal &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={clearFilters}
              >
                <Text style={styles.cancelText}>
                  Clear All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() =>
                  setShowFilterModal(false)
                }
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCommentModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Comment
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowCommentModal(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Share your thoughts about this build..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              style={styles.commentInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowCommentModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  postingComment &&
                    styles.disabledButton,
                ]}
                disabled={postingComment}
                onPress={handleAddComment}
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  {postingComment
                    ? "Posting..."
                    : "Post Comment"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowSaveModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Save to My Builds
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowSaveModal(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalDescription}
            >
              This will save a copy of this
              community build to your personal
              builds collection.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowSaveModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  savingBuild &&
                    styles.disabledButton,
                ]}
                disabled={savingBuild}
                onPress={handleSaveToBuild}
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  {savingBuild
                    ? "Saving..."
                    : "Save Build"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Service Modal */}
      <Modal
        visible={showServiceModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowServiceModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Request Service
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowServiceModal(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalDescription}
            >
              This will take you to Service
              Requests where you can select your
              motorcycle and schedule installation
              of the parts from this community
              build.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowServiceModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleServiceRequest}
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value?.toDate) {
    return value
      .toDate()
      .toISOString()
      .split("T")[0];
  }

  if (value instanceof Date) {
    return value
      .toISOString()
      .split("T")[0];
  }

  return "—";
};

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  intro: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  introTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },

  introSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
  },

  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  searchBox: {
    flex: 1,
    minHeight: 44,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  searchIcon: {
    color: "#9ca3af",
    fontSize: 20,
    marginRight: 5,
  },

  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
  },

  filterButton: {
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    color: "#ffffff",
    fontSize: 17,
    marginRight: 5,
  },

  filterButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    marginLeft: 6,
  },

  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  resultsTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },

  popularity: {
    flexDirection: "row",
    alignItems: "center",
  },

  trendingIcon: {
    color: "#6b7280",
    fontSize: 15,
    marginRight: 4,
  },

  popularityText: {
    color: "#6b7280",
    fontSize: 10,
  },

  buildCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginBottom: 12,
  },

  buildCardHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  buildHeaderInfo: {
    flex: 1,
  },

  buildCardTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },

  builderName: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 3,
  },

  goalBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  goalBadgeLarge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  performanceBadge: {
    backgroundColor: "#fee2e2",
  },

  safetyBadge: {
    backgroundColor: "#dcfce7",
  },

  aestheticBadge: {
    backgroundColor: "#f3e8ff",
  },

  goalBadgeText: {
    color: "#374151",
    fontSize: 10,
    fontWeight: "700",
  },

  buildDescription: {
    color: "#4b5563",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 14,
  },

  statText: {
    color: "#6b7280",
    fontSize: 10,
  },

  buildFooter: {
    backgroundColor: "#f9fafb",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  voteGroup: {
    flexDirection: "row",
    gap: 6,
  },

  voteButton: {
    minWidth: 55,
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  voteIcon: {
    color: "#4b5563",
    fontSize: 14,
    marginRight: 4,
  },

  voteText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  voteTextLight: {
    color: "#ffffff",
  },

  upvoteActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },

  downvoteActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },

  viewButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  viewButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  emptyIcon: {
    color: "#9ca3af",
    fontSize: 35,
    marginBottom: 8,
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backIcon: {
    color: "#4b5563",
    fontSize: 20,
    marginRight: 6,
  },

  backText: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "600",
  },

  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 12,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  detailsHeaderInfo: {
    flex: 1,
  },

  detailsTitle: {
    color: "#111827",
    fontSize: 21,
    fontWeight: "700",
  },

  detailsSubtitle: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },

  detailsDescription: {
    color: "#4b5563",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
  },

  detailsStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },

  detailStatBox: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  detailStatLabel: {
    color: "#6b7280",
    fontSize: 9,
    marginBottom: 3,
  },

  detailStatValue: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },

  detailStatValueSmall: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  detailPartRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    marginBottom: 8,
  },

  partIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  partIconText: {
    color: "#ffffff",
    fontSize: 17,
  },

  partInfo: {
    flex: 1,
  },

  partName: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },

  partCategory: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 3,
  },

  safetyNotesBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  safetyNotesTitle: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 7,
  },

  safetyNotesText: {
    color: "#92400e",
    fontSize: 12,
    lineHeight: 18,
  },

  detailVoteRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  detailVoteButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  detailVoteText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },

  darkButton: {
    minHeight: 46,
    backgroundColor: "#111827",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
  },

  buttonIcon: {
    color: "#ffffff",
    fontSize: 15,
    marginRight: 7,
  },

  darkButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },

  commentButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  commentButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },

  noComments: {
    color: "#9ca3af",
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 20,
  },

  commentCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 11,
    marginBottom: 8,
  },

  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 5,
  },

  commentUser: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700",
  },

  commentDate: {
    color: "#9ca3af",
    fontSize: 9,
  },

  commentText: {
    color: "#4b5563",
    fontSize: 11,
    lineHeight: 17,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },

  closeText: {
    color: "#6b7280",
    fontSize: 26,
    lineHeight: 27,
    marginLeft: 10,
  },

  modalLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 8,
  },

  modalDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  filterScroll: {
    marginBottom: 3,
  },

  filterChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 7,
    marginBottom: 7,
  },

  filterChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  filterChipText: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "600",
  },

  filterChipTextActive: {
    color: "#ffffff",
  },

  goalFilterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  applyButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  applyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  commentInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    color: "#111827",
    fontSize: 12,
  },
});