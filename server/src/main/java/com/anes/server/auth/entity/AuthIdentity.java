package com.anes.server.auth.entity;

import com.anes.server.common.entity.BaseEntity;
import com.anes.server.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "auth_identities",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_provider_provider_uid",
                columnNames = {"provider", "provider_uid"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class AuthIdentity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    @Column(name = "provider_uid", nullable = false)
    private String providerUid;

    @Column(name = "email", length = 150)
    private String email;

    public AuthIdentity(User user, String provider, String providerUid, String email) {
        this.user = user;
        this.provider = provider;
        this.providerUid = providerUid;
        this.email = email;
    }
}
