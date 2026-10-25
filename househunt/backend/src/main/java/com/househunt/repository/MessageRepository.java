package com.househunt.repository;

import com.househunt.entity.Message;
import com.househunt.entity.Property;
import com.househunt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("select m from Message m where (m.sender = :me and m.recipient = :other) or (m.sender = :other and m.recipient = :me) order by m.createdAt asc")
    List<Message> conversation(@Param("me") User me, @Param("other") User other);

    @Query("select count(m) from Message m where m.recipient = :user and m.read = false")
    long unreadCount(@Param("user") User user);

    @Query("select distinct m.sender from Message m where m.recipient = :user")
    List<User> sendersTo(@Param("user") User user);

    @Query("select distinct m.recipient from Message m where m.sender = :me")
    List<User> recipientsFrom(@Param("me") User me);

    List<Message> findAllBySenderAndRecipientAndReadFalse(User sender, User recipient);

    long deleteByProperty(Property property);
    long deleteBySender(com.househunt.entity.User sender);
    long deleteByRecipient(com.househunt.entity.User recipient);
}
