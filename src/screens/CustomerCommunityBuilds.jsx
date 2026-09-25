import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";

const initialCommunityBuilds = [
  {
    id: "cb-1",
    userName: "Angela Santos",
    motorcycleBrand: "Honda",
    motorcycleModel: "CBR600RR",
    motorcycleYear: 2022,
    buildGoal: "Performance",
    parts: [
      {
        name: "Akrapovic Exhaust System",
        category: "Exhaust",
      },
      {
        name: "K&N Air Filter",
        category: "Air Intake",
      },
      {
        name: "ECU Flash Tune",
        category: "Electronics",
      },
      {
        name: "Race Brake Pads",
        category: "Brakes",
      },
    ],
    compatibilityScore: 95,
    safetyNotes:
      "Ensure proper ECU tuning after exhaust installation. Brake upgrade recommended for increased power.",
    dateShared: "2026-03-15",
    upvotes: 124,
    downvotes: 8,
    comments: [
      {
        id: "c1",
        userName: "Miguel Dela Cruz",
        text: "Great build! How much HP gain did you see?",
        timestamp: "03/16/2026 10:30 AM",
      },
      {
        id: "c2",
        userName: "Angela Santos",
        text: "Around 12-15hp at the wheel!",
        timestamp: "03/16/2026 11:20 AM",
      },
    ],
    description:
      "Track-focused performance build with emphasis on power delivery and braking.",
    estimatedCost: 85000,
    difficultyLevel: "Advanced",
  },
  {
    id: "cb-2",
    userName: "Miguel Dela Cruz",
    motorcycleBrand: "Yamaha",
    motorcycleModel: "R1",
    motorcycleYear: 2023,
    buildGoal: "Aesthetic",
    parts: [
      {
        name: "LED Headlight Kit",
        category: "Lighting",
      },
      {
        name: "Custom Paint Job",
        category: "Body",
      },
      {
        name: "Carbon Fiber Tank Pad",
        category: "Body",
      },
      {
        name: "Smoked Windscreen",
        category: "Body",
      },
    ],
    compatibilityScore: 98,
    safetyNotes:
      "Ensure LED headlights are DOT approved for street use.",
    dateShared: "2026-03-18",
    upvotes: 89,
    downvotes: 3,
    comments: [
      {
        id: "c3",
        userName: "Carlos Reyes",
        text: "Looks amazing! Where did you get the paint done?",
        timestamp: "03/19/2026 02:15 PM",
      },
    ],
    description:
      "Clean aesthetic build focusing on visual appeal while maintaining functionality.",
    estimatedCost: 45000,
    difficultyLevel: "Intermediate",
  },
  {
    id: "cb-3",
    userName: "Carlos Reyes",
    motorcycleBrand: "Kawasaki",
    motorcycleModel: "Ninja ZX-10R",
    motorcycleYear: 2021,
    buildGoal: "Safety",
    parts: [
      {
        name: "ABS Brake System Upgrade",
        category: "Brakes",
      },
      {
        name: "Frame Sliders",
        category: "Protection",
      },
      {
        name: "LED Turn Signals",
        category: "Lighting",
      },
      {
        name: "Grip Heaters",
        category: "Comfort",
      },
    ],
    compatibilityScore: 100,
    safetyNotes:
      "All parts meet safety standards. Professional installation recommended for ABS system.",
    dateShared: "2026-03-20",
    upvotes: 156,
    downvotes: 2,
    comments: [
      {
        id: "c4",
        userName: "Angela Santos",
        text: "Safety first! Great choices.",
        timestamp: "03/21/2026 09:00 AM",
      },
      {
        id: "c5",
        userName: "Miguel Dela Cruz",
        text: "How much did the ABS upgrade cost?",
        timestamp: "03/21/2026 10:45 AM",
      },
      {
        id: "c6",
        userName: "Carlos Reyes",
        text: "About 35k including installation",
        timestamp: "03/21/2026 11:30 AM",
      },
    ],
    description:
      "Comprehensive safety upgrade package for street and touring riders.",
    estimatedCost: 62000,
    difficultyLevel: "Advanced",
  },
  {
    id: "cb-4",
    userName: "Patricia Mendoza",
    motorcycleBrand: "Honda",
    motorcycleModel: "CB500X",
    motorcycleYear: 2023,
    buildGoal: "Performance",
    parts: [
      {
        name: "Slip-On Exhaust",
        category: "Exhaust",
      },
      {
        name: "High-Flow Air Filter",
        category: "Air Intake",
      },
      {
        name: "Fuel Controller",
        category: "Electronics",
      },
    ],
    compatibilityScore: 92,
    safetyNotes:
      "Fuel controller required for proper air/fuel ratio after intake and exhaust modifications.",
    dateShared: "2026-03-12",
    upvotes: 67,
    downvotes: 5,
    comments: [],
    description:
      "Budget-friendly performance upgrades for the CB500X adventure bike.",
    estimatedCost: 28000,
    difficultyLevel: "Beginner",
  },
  {
    id: "cb-5",
    userName: "Marco Villanueva",
    motorcycleBrand: "Suzuki",
    motorcycleModel: "GSX-R750",
    motorcycleYear: 2022,
    buildGoal: "Performance",
    parts: [
      {
        name: "Racing Suspension Kit",
        category: "Suspension",
      },
      {
        name: "Lightweight Battery",
        category: "Electronics",
      },
      {
        name: "Quick Shifter",
        category: "Transmission",
      },
      {
        name: "Titanium Exhaust",
        category: "Exhaust",
      },
    ],
    compatibilityScore: 88,
    safetyNotes:
      "Suspension setup requires professional tuning. Quick shifter needs ECU compatibility check.",
    dateShared: "2026-03-10",
    upvotes: 201,
    downvotes: 12,
    comments: [
      {
        id: "c7",
        userName: "Carlos Reyes",
        text: "That titanium exhaust must sound incredible!",
        timestamp: "03/11/2026 04:20 PM",
      },
    ],
    description:
      "Race-spec build designed for track days with focus on weight reduction and handling.",
    estimatedCost: 125000,
    difficultyLevel: "Advanced",
  },
  {
    id: "cb-6",
    userName: "Maria Santos",
    motorcycleBrand: "Yamaha",
    motorcycleModel: "MT-09",
    motorcycleYear: 2023,
    buildGoal: "Aesthetic",
    parts: [
      {
        name: "LED Strip Lights",
        category: "Lighting",
      },
      {
        name: "Custom Seat Cover",
        category: "Comfort",
      },
      {
        name: "Bar End Mirrors",
        category: "Body",
      },
      {
        name: "Fender Eliminator Kit",
        category: "Body",
      },
    ],
    compatibilityScore: 96,
    safetyNotes:
      "Ensure mirrors meet visibility requirements. Check local regulations for fender elimination.",
    dateShared: "2026-03-08",
    upvotes: 73,
    downvotes: 4,
    comments: [
      {
        id: "c8",
        userName: "Angela Santos",
        text: "Love the clean look!",
        timestamp: "03/09/2026 01:40 PM",
      },
    ],
    description:
      "Street-style aesthetic modifications for a cleaner, more aggressive appearance.",
    estimatedCost: 18000,
    difficultyLevel: "Beginner",
  },
];

export default function CustomerCommunityBuilds() {
  const [communityBuilds, setCommunityBuilds] = useState(
    initialCommunityBuilds
  );

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

  const brands = useMemo(() => {
    return [
      "All",
      ...new Set(
        communityBuilds.map(
          (build) => build.motorcycleBrand
        )
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
        builds.map(
          (build) => build.motorcycleModel
        )
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
    const search = searchTerm.toLowerCase();

    return communityBuilds
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
      .filter(
        (build) =>
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
            .includes(search)
      )
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

  const handleVote = (buildId, voteType) => {
    const currentReaction = userReactions[buildId];

    const nextReactions = {
      ...userReactions,
    };

    if (currentReaction === voteType) {
      delete nextReactions[buildId];
    } else {
      nextReactions[buildId] = voteType;
    }

    const updatedBuilds = communityBuilds.map(
      (build) => {
        if (build.id !== buildId) {
          return build;
        }

        let upvotes = build.upvotes;
        let downvotes = build.downvotes;

        if (currentReaction === "upvote") {
          upvotes--;
        }

        if (currentReaction === "downvote") {
          downvotes--;
        }

        if (
          nextReactions[buildId] === "upvote"
        ) {
          upvotes++;
        }

        if (
          nextReactions[buildId] === "downvote"
        ) {
          downvotes++;
        }

        return {
          ...build,
          upvotes,
          downvotes,
        };
      }
    );

    setCommunityBuilds(updatedBuilds);
    setUserReactions(nextReactions);

    if (selectedBuild) {
      const updatedSelected =
        updatedBuilds.find(
          (build) => build.id === buildId
        );

      setSelectedBuild(updatedSelected);
    }
  };

  const handleAddComment = () => {
    if (
      !newComment.trim() ||
      !selectedBuild
    ) {
      return;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      userName: "Carlos Reyes",
      text: newComment.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updatedBuilds =
      communityBuilds.map((build) => {
        if (build.id !== selectedBuild.id) {
          return build;
        }

        return {
          ...build,
          comments: [
            ...build.comments,
            comment,
          ],
        };
      });

    setCommunityBuilds(updatedBuilds);

    setSelectedBuild(
      updatedBuilds.find(
        (build) =>
          build.id === selectedBuild.id
      )
    );

    setNewComment("");
    setShowCommentModal(false);
  };

  const handleSaveToBuild = () => {
    setShowSaveModal(false);
  };

  const handleServiceRequest = () => {
    setShowServiceModal(false);
  };

  const clearFilters = () => {
    setBrandFilter("All");
    setModelFilter("All");
    setGoalFilter("All");
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
                Discover motorcycle setups shared by the MPRSS
                community, from performance upgrades to safety
                and aesthetic builds.
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

                <Text style={styles.filterButtonText}>
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
                <View style={styles.buildCardHeader}>
                  <View style={styles.buildHeaderInfo}>
                    <Text style={styles.buildCardTitle}>
                      {build.motorcycleBrand}{" "}
                      {build.motorcycleModel}
                    </Text>

                    <Text style={styles.builderName}>
                      by {build.userName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.goalBadge,
                      build.buildGoal ===
                        "Performance" &&
                        styles.performanceBadge,
                      build.buildGoal === "Safety" &&
                        styles.safetyBadge,
                      build.buildGoal ===
                        "Aesthetic" &&
                        styles.aestheticBadge,
                    ]}
                  >
                    <Text
                      style={styles.goalBadgeText}
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
                      style={[
                        styles.voteButton,
                        userReactions[build.id] ===
                          "upvote" &&
                          styles.upvoteActive,
                      ]}
                      onPress={() =>
                        handleVote(
                          build.id,
                          "upvote"
                        )
                      }
                    >
                      <Text style={styles.voteIcon}>
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
                      style={[
                        styles.voteButton,
                        userReactions[build.id] ===
                          "downvote" &&
                          styles.downvoteActive,
                      ]}
                      onPress={() =>
                        handleVote(
                          build.id,
                          "downvote"
                        )
                      }
                    >
                      <Text style={styles.voteIcon}>
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
                <View style={styles.detailsHeaderInfo}>
                  <Text style={styles.detailsTitle}>
                    {selectedBuild.motorcycleBrand}{" "}
                    {selectedBuild.motorcycleModel}
                  </Text>

                  <Text style={styles.detailsSubtitle}>
                    {selectedBuild.motorcycleYear} • by{" "}
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

              <Text style={styles.detailsDescription}>
                {selectedBuild.description}
              </Text>

              <View style={styles.detailsStats}>
                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>
                    Compatibility
                  </Text>

                  <Text style={styles.detailStatValue}>
                    {selectedBuild.compatibilityScore}%
                  </Text>
                </View>

                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>
                    Est. Cost
                  </Text>

                  <Text style={styles.detailStatValue}>
                    ₱
                    {selectedBuild.estimatedCost.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>
                    Difficulty
                  </Text>

                  <Text style={styles.detailStatValueSmall}>
                    {selectedBuild.difficultyLevel}
                  </Text>
                </View>

                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>
                    Date Shared
                  </Text>

                  <Text style={styles.detailStatValueSmall}>
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
                    key={index}
                    style={styles.detailPartRow}
                  >
                    <View style={styles.partIcon}>
                      <Text
                        style={
                          styles.partIconText
                        }
                      >
                        ▣
                      </Text>
                    </View>

                    <View style={styles.partInfo}>
                      <Text style={styles.partName}>
                        {part.name}
                      </Text>

                      <Text
                        style={styles.partCategory}
                      >
                        {part.category}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* Safety */}
            <View style={styles.safetyNotesBox}>
              <Text style={styles.safetyNotesTitle}>
                ⚠ Safety Notes
              </Text>

              <Text style={styles.safetyNotesText}>
                {selectedBuild.safetyNotes}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.detailsCard}>
              <View style={styles.detailVoteRow}>
                <TouchableOpacity
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

                <Text style={styles.darkButtonText}>
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

                <Text style={styles.darkButtonText}>
                  Request Service
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments */}
            <View style={styles.detailsCard}>
              <View style={styles.commentsHeader}>
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
                  No comments yet. Be the first to
                  comment!
                </Text>
              ) : (
                selectedBuild.comments.map(
                  (comment) => (
                    <View
                      key={comment.id}
                      style={styles.commentCard}
                    >
                      <View style={styles.commentTop}>
                        <Text
                          style={
                            styles.commentUser
                          }
                        >
                          {comment.userName}
                        </Text>

                        <Text
                          style={
                            styles.commentDate
                          }
                        >
                          {comment.timestamp}
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
                  style={styles.applyButtonText}
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
                style={styles.applyButton}
                onPress={handleAddComment}
              >
                <Text
                  style={styles.applyButtonText}
                >
                  Post Comment
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

            <Text style={styles.modalDescription}>
              This will save a copy of this community
              build to your personal builds collection.
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
                style={styles.applyButton}
                onPress={handleSaveToBuild}
              >
                <Text
                  style={styles.applyButtonText}
                >
                  Save Build
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

            <Text style={styles.modalDescription}>
              This will create a service request to
              install the parts from this community
              build on your motorcycle.
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
                  style={styles.applyButtonText}
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