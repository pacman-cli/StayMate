package com.webapp.domain.roommate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoommatePostRepository extends JpaRepository<RoommatePost, Long> {

        List<RoommatePost> findByUserId(Long userId);

        long countByStatus(RoommatePostStatus status);

        @Query("SELECT r FROM RoommatePost r WHERE " +
                        "(r.status = com.webapp.domain.roommate.RoommatePostStatus.APPROVED OR r.status = com.webapp.domain.roommate.RoommatePostStatus.PENDING) AND "
                        +
                        "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
                        "(:minBudget IS NULL OR r.budget >= :minBudget) AND " +
                        "(:maxBudget IS NULL OR r.budget <= :maxBudget) AND " +
                        "(:genderPreference IS NULL OR r.genderPreference = :genderPreference)")
        List<RoommatePost> searchPosts(
                        @Param("location") String location,
                        @Param("minBudget") Double minBudget,
                        @Param("maxBudget") Double maxBudget,
                        @Param("genderPreference") String genderPreference);
}
